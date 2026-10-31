-- Lessons, their notes, recordings and lesson attendance. Go owns writes to
-- these tables.
--
-- Who sees a lesson: leaders of the class's school and the class's teacher
-- (every lesson), and students enrolled in the class or their approved
-- parents (lessons that are not drafts).

-- name: CountVisibleLessons :one
SELECT count(*)
FROM lessons_lesson l
JOIN classes_class c ON c.id = l.parent_class_id
WHERE (c.institution_id = ANY(sqlc.arg(leader_schools)::bigint[])
       OR (c.teacher_id = sqlc.arg(viewer_id) AND c.institution_id = ANY(sqlc.arg(teacher_schools)::bigint[]))
       OR (l.access_mode <> 'draft' AND EXISTS (
             SELECT 1 FROM classes_classenrollment e
             WHERE e.enrolled_class_id = c.id AND e.status = 'active'
               AND e.student_id = ANY(sqlc.arg(learner_ids)::bigint[]))))
  AND (sqlc.narg(parent_class)::bigint IS NULL OR l.parent_class_id = sqlc.narg(parent_class))
  AND (sqlc.narg(topic)::bigint IS NULL OR l.topic_id = sqlc.narg(topic))
  AND (sqlc.narg(access_mode)::text IS NULL OR l.access_mode = sqlc.narg(access_mode));

-- name: ListVisibleLessons :many
SELECT l.id, l.title, l.access_mode, l.scheduled_at, l.published_at, l.created_at,
       l.parent_class_id, l.topic_id, c.title AS class_title, COALESCE(t.name, '')::text AS topic_name
FROM lessons_lesson l
JOIN classes_class c ON c.id = l.parent_class_id
LEFT JOIN curriculum_topic t ON t.id = l.topic_id
WHERE (c.institution_id = ANY(sqlc.arg(leader_schools)::bigint[])
       OR (c.teacher_id = sqlc.arg(viewer_id) AND c.institution_id = ANY(sqlc.arg(teacher_schools)::bigint[]))
       OR (l.access_mode <> 'draft' AND EXISTS (
             SELECT 1 FROM classes_classenrollment e
             WHERE e.enrolled_class_id = c.id AND e.status = 'active'
               AND e.student_id = ANY(sqlc.arg(learner_ids)::bigint[]))))
  AND (sqlc.narg(parent_class)::bigint IS NULL OR l.parent_class_id = sqlc.narg(parent_class))
  AND (sqlc.narg(topic)::bigint IS NULL OR l.topic_id = sqlc.narg(topic))
  AND (sqlc.narg(access_mode)::text IS NULL OR l.access_mode = sqlc.narg(access_mode))
ORDER BY l.scheduled_at, l.id
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: GetVisibleLesson :one
SELECT l.id, l.title, l.access_mode, l.scheduled_at, l.published_at, l.created_at,
       l.parent_class_id, l.topic_id, c.title AS class_title, COALESCE(t.name, '')::text AS topic_name,
       c.institution_id, c.teacher_id
FROM lessons_lesson l
JOIN classes_class c ON c.id = l.parent_class_id
LEFT JOIN curriculum_topic t ON t.id = l.topic_id
WHERE l.id = sqlc.arg(id)
  AND (c.institution_id = ANY(sqlc.arg(leader_schools)::bigint[])
       OR (c.teacher_id = sqlc.arg(viewer_id) AND c.institution_id = ANY(sqlc.arg(teacher_schools)::bigint[]))
       OR (l.access_mode <> 'draft' AND EXISTS (
             SELECT 1 FROM classes_classenrollment e
             WHERE e.enrolled_class_id = c.id AND e.status = 'active'
               AND e.student_id = ANY(sqlc.arg(learner_ids)::bigint[]))));

-- name: LessonClassOwner :one
SELECT institution_id, teacher_id FROM classes_class WHERE id = $1;

-- name: CreateLesson :one
INSERT INTO lessons_lesson (title, access_mode, scheduled_at, published_at, created_at, parent_class_id, topic_id)
VALUES (sqlc.arg(title), sqlc.arg(access_mode)::text, sqlc.arg(scheduled_at),
        CASE WHEN sqlc.arg(access_mode)::text <> 'draft' THEN now() END, now(),
        sqlc.arg(parent_class_id), sqlc.narg(topic_id))
RETURNING id;

-- name: UpdateLesson :exec
-- published_at is set the first time a lesson leaves draft and kept after.
UPDATE lessons_lesson
SET title = sqlc.arg(title), access_mode = sqlc.arg(access_mode)::text, scheduled_at = sqlc.arg(scheduled_at),
    topic_id = sqlc.narg(topic_id),
    published_at = COALESCE(published_at, CASE WHEN sqlc.arg(access_mode)::text <> 'draft' THEN now() END)
WHERE id = sqlc.arg(id);

-- name: LessonHasHistory :one
-- Attendance, live sessions, payouts and content mean a lesson must be kept.
SELECT (EXISTS (SELECT 1 FROM lessons_lessonattendance WHERE lesson_id = sqlc.arg(id)::bigint)
    OR EXISTS (SELECT 1 FROM attendance_lessonattendance WHERE lesson_id = sqlc.arg(id)::bigint)
    OR EXISTS (SELECT 1 FROM live_sessions_livesession WHERE lesson_id = sqlc.arg(id)::bigint)
    OR EXISTS (SELECT 1 FROM lessons_lessonqualificationrecord WHERE lesson_id = sqlc.arg(id)::bigint)
    OR EXISTS (SELECT 1 FROM resources_contentitem WHERE lesson_id = sqlc.arg(id)::bigint)
    OR EXISTS (SELECT 1 FROM resources_contentassignment WHERE lesson_id = sqlc.arg(id)::bigint))::boolean AS in_use;

-- name: DeleteLessonNotes :exec
DELETE FROM lessons_lessonnote WHERE lesson_id = $1;

-- name: DeleteLessonRecordings :exec
DELETE FROM lessons_lessonrecording WHERE lesson_id = $1;

-- name: DeleteLessonResourceLinks :exec
DELETE FROM resources_resourcelessonlink WHERE lesson_id = $1;

-- name: UnplanLessonInstances :exec
UPDATE lessons_lessoninstance SET lesson_plan_id = NULL WHERE lesson_plan_id = $1;

-- name: DeleteLesson :exec
DELETE FROM lessons_lesson WHERE id = $1;

-- ---- notes and recordings (visible when their lesson is) ----------------------

-- name: ListLessonNotes :many
SELECT id, content_blocks, created_at, updated_at, lesson_id
FROM lessons_lessonnote WHERE lesson_id = ANY(sqlc.arg(lesson_ids)::bigint[])
ORDER BY created_at, id;

-- name: GetLessonNote :one
SELECT id, content_blocks, created_at, updated_at, lesson_id FROM lessons_lessonnote WHERE id = $1;

-- name: CreateLessonNote :one
INSERT INTO lessons_lessonnote (content_blocks, created_at, updated_at, lesson_id)
VALUES ($1, now(), now(), $2)
RETURNING id, content_blocks, created_at, updated_at, lesson_id;

-- name: UpdateLessonNote :one
UPDATE lessons_lessonnote SET content_blocks = $2, updated_at = now() WHERE id = $1
RETURNING id, content_blocks, created_at, updated_at, lesson_id;

-- name: DeleteLessonNote :exec
DELETE FROM lessons_lessonnote WHERE id = $1;

-- name: ListLessonRecordings :many
SELECT id, url, duration, created_at, lesson_id
FROM lessons_lessonrecording WHERE lesson_id = ANY(sqlc.arg(lesson_ids)::bigint[])
ORDER BY created_at, id;

-- name: GetLessonRecording :one
SELECT id, url, duration, created_at, lesson_id FROM lessons_lessonrecording WHERE id = $1;

-- name: CreateLessonRecording :one
INSERT INTO lessons_lessonrecording (url, duration, created_at, lesson_id)
VALUES ($1, $2, now(), $3)
RETURNING id, url, duration, created_at, lesson_id;

-- name: DeleteLessonRecording :exec
DELETE FROM lessons_lessonrecording WHERE id = $1;

-- ---- lesson attendance ----------------------------------------------------------

-- name: ListLessonAttendance :many
-- Staff pass the lessons they manage; learners see only their own rows.
SELECT a.id, a.status, a.duration_minutes, a.recorded_at, a.lesson_id, a.student_id, u.full_name AS student_name
FROM lessons_lessonattendance a
JOIN accounts_user u ON u.id = a.student_id
WHERE a.lesson_id = sqlc.arg(lesson_id)
  AND (sqlc.arg(all_students)::boolean OR a.student_id = ANY(sqlc.arg(learner_ids)::bigint[]))
ORDER BY u.full_name, a.id;

-- name: ActivelyEnrolled :one
SELECT EXISTS (SELECT 1 FROM classes_classenrollment
               WHERE enrolled_class_id = $1 AND student_id = $2 AND status = 'active');

-- name: LockLessonAttendance :exec
SELECT pg_advisory_xact_lock(hashtextextended('lesson-attendance:' || sqlc.arg(lesson_id)::bigint::text, 0));

-- name: UpdateLessonAttendance :one
UPDATE lessons_lessonattendance
SET status = $3, duration_minutes = $4, recorded_at = now()
WHERE lesson_id = $1 AND student_id = $2
RETURNING id, recorded_at;

-- name: InsertLessonAttendance :one
INSERT INTO lessons_lessonattendance (status, duration_minutes, recorded_at, lesson_id, student_id)
VALUES ($3, $4, now(), $1, $2)
RETURNING id, recorded_at;
