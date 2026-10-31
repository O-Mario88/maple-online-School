-- Terms, rooms and timetable slots. Go owns writes to these tables.

-- name: ListTerms :many
SELECT id, institution_id, name, start_date, end_date, is_active
FROM scheduling_academicterm
WHERE institution_id = ANY(sqlc.arg(school_ids)::bigint[])
ORDER BY start_date DESC, id DESC;

-- name: CreateTerm :one
INSERT INTO scheduling_academicterm (institution_id, name, start_date, end_date, is_active)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, institution_id, name, start_date, end_date, is_active;

-- name: DeactivateOtherTerms :exec
UPDATE scheduling_academicterm SET is_active = false WHERE institution_id = $1 AND id <> $2;

-- name: ListRooms :many
SELECT id, institution_id, name, capacity, is_active
FROM scheduling_room
WHERE institution_id = ANY(sqlc.arg(school_ids)::bigint[]) AND is_active
ORDER BY name;

-- name: CreateRoom :one
INSERT INTO scheduling_room (institution_id, name, capacity, is_active)
VALUES ($1, $2, $3, true)
RETURNING id, institution_id, name, capacity, is_active;

-- name: RoomInSchool :one
SELECT EXISTS (SELECT 1 FROM scheduling_room WHERE id = $1 AND institution_id = $2 AND is_active);

-- name: ListSlots :many
-- Leaders see their schools' slots, teachers the slots they teach, and
-- learners (students or a parent's approved children) their classes' slots.
SELECT s.id, s.institution_id, s.term_id, s.assigned_class_id, c.title AS class_title,
       s.day_of_week, s.start_time, s.end_time, s.room_id, COALESCE(r.name, '')::text AS room_name,
       s.teacher_id, COALESCE(u.full_name, '')::text AS teacher_name, s.is_draft
FROM scheduling_timetableslot s
JOIN classes_class c ON c.id = s.assigned_class_id
LEFT JOIN scheduling_room r ON r.id = s.room_id
LEFT JOIN accounts_user u ON u.id = s.teacher_id
WHERE s.is_active
  AND (s.institution_id = ANY(sqlc.arg(leader_schools)::bigint[])
       OR s.teacher_id = sqlc.arg(viewer_id)
       OR EXISTS (SELECT 1 FROM classes_classenrollment e
                  WHERE e.enrolled_class_id = s.assigned_class_id AND e.status = 'active'
                    AND e.student_id = ANY(sqlc.arg(learner_ids)::bigint[])))
  AND (sqlc.narg(term_id)::bigint IS NULL OR s.term_id = sqlc.narg(term_id)::bigint)
  AND (sqlc.narg(class_id)::bigint IS NULL OR s.assigned_class_id = sqlc.narg(class_id)::bigint)
  AND (sqlc.narg(day)::int IS NULL OR s.day_of_week = sqlc.narg(day)::int)
ORDER BY s.day_of_week, s.start_time, c.title
LIMIT 500;

-- name: SlotClashes :many
-- Active slots in the same term and day that overlap in time and share the
-- class, the teacher or the room.
SELECT s.id, c.title AS class_title,
       COALESCE(s.assigned_class_id = sqlc.arg(class_id), false)::boolean AS same_class,
       COALESCE(s.teacher_id = sqlc.narg(teacher_id)::bigint, false)::boolean AS same_teacher,
       COALESCE(s.room_id = sqlc.narg(room_id)::bigint, false)::boolean AS same_room
FROM scheduling_timetableslot s
JOIN classes_class c ON c.id = s.assigned_class_id
WHERE s.is_active AND s.term_id = sqlc.arg(term_id) AND s.day_of_week = sqlc.arg(day)
  AND s.start_time < sqlc.arg(end_time)::time AND s.end_time > sqlc.arg(start_time)::time
  AND (s.assigned_class_id = sqlc.arg(class_id)
       OR (s.teacher_id IS NOT NULL AND s.teacher_id = sqlc.narg(teacher_id)::bigint)
       OR (s.room_id IS NOT NULL AND s.room_id = sqlc.narg(room_id)::bigint));

-- name: CreateSlot :one
INSERT INTO scheduling_timetableslot (institution_id, term_id, assigned_class_id, day_of_week, start_time, end_time,
  room_id, teacher_id, is_active, is_draft)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, false)
RETURNING id;

-- name: SlotSchool :one
SELECT institution_id FROM scheduling_timetableslot WHERE id = $1 AND is_active;

-- name: RemoveSlot :exec
UPDATE scheduling_timetableslot SET is_active = false WHERE id = $1;
