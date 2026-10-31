-- Classes, enrolment and the daily register. Go owns writes to these tables.
--
-- Who sees a class: leaders of its school, its own teacher, and students
-- (or their approved parents) with an active enrolment in it.

-- name: CountVisibleClasses :one
SELECT count(*)
FROM classes_class c
WHERE c.institution_id = ANY(sqlc.arg(leader_schools)::bigint[])
   OR (c.teacher_id = sqlc.arg(viewer_id) AND c.institution_id = ANY(sqlc.arg(teacher_schools)::bigint[]))
   OR EXISTS (SELECT 1 FROM classes_classenrollment e
              WHERE e.enrolled_class_id = c.id AND e.status = 'active'
                AND e.student_id = ANY(sqlc.arg(learner_ids)::bigint[]));

-- name: ListVisibleClasses :many
SELECT c.id, c.institution_id, c.institution_subject_id,
       COALESCE(NULLIF(isub.custom_name, ''), cs.name, '')::text AS subject_name,
       c.class_level_id, cl.name AS class_level_name, c.teacher_id, u.full_name AS teacher_name,
       c.title, c.visibility, c.is_published, c.created_at
FROM classes_class c
JOIN curriculum_classlevel cl ON cl.id = c.class_level_id
JOIN accounts_user u ON u.id = c.teacher_id
LEFT JOIN institutions_institutionsubject isub ON isub.id = c.institution_subject_id
LEFT JOIN curriculum_subject cs ON cs.id = isub.subject_id
WHERE c.institution_id = ANY(sqlc.arg(leader_schools)::bigint[])
   OR (c.teacher_id = sqlc.arg(viewer_id) AND c.institution_id = ANY(sqlc.arg(teacher_schools)::bigint[]))
   OR EXISTS (SELECT 1 FROM classes_classenrollment e
              WHERE e.enrolled_class_id = c.id AND e.status = 'active'
                AND e.student_id = ANY(sqlc.arg(learner_ids)::bigint[]))
ORDER BY c.title, c.id
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: GetVisibleClass :one
SELECT c.id, c.institution_id, c.institution_subject_id,
       COALESCE(NULLIF(isub.custom_name, ''), cs.name, '')::text AS subject_name,
       c.class_level_id, cl.name AS class_level_name, c.teacher_id, u.full_name AS teacher_name,
       c.title, c.visibility, c.is_published, c.created_at
FROM classes_class c
JOIN curriculum_classlevel cl ON cl.id = c.class_level_id
JOIN accounts_user u ON u.id = c.teacher_id
LEFT JOIN institutions_institutionsubject isub ON isub.id = c.institution_subject_id
LEFT JOIN curriculum_subject cs ON cs.id = isub.subject_id
WHERE c.id = sqlc.arg(id)
  AND (c.institution_id = ANY(sqlc.arg(leader_schools)::bigint[])
       OR (c.teacher_id = sqlc.arg(viewer_id) AND c.institution_id = ANY(sqlc.arg(teacher_schools)::bigint[]))
       OR EXISTS (SELECT 1 FROM classes_classenrollment e
                  WHERE e.enrolled_class_id = c.id AND e.status = 'active'
                    AND e.student_id = ANY(sqlc.arg(learner_ids)::bigint[])));

-- name: IsActiveMember :one
SELECT EXISTS (SELECT 1 FROM institutions_institutionmembership
               WHERE user_id = $1 AND institution_id = $2 AND status = 'active'
                 AND role = ANY(sqlc.arg(member_roles)::text[]));

-- name: ClassLevelExists :one
SELECT EXISTS (SELECT 1 FROM curriculum_classlevel WHERE id = $1);

-- name: CreateClass :one
INSERT INTO classes_class (title, visibility, is_published, created_at, class_level_id, institution_id, teacher_id)
VALUES ($1, 'private', $2, now(), $3, $4, $5)
RETURNING id;

-- name: UpdateClass :exec
UPDATE classes_class
SET title = COALESCE(sqlc.narg(title), title),
    teacher_id = COALESCE(sqlc.narg(teacher_id), teacher_id),
    is_published = COALESCE(sqlc.narg(is_published), is_published)
WHERE id = sqlc.arg(id);

-- name: ClassRoster :many
SELECT e.id AS enrollment_id, e.student_id, u.full_name AS student_name, e.status, e.enrolled_at
FROM classes_classenrollment e
JOIN accounts_user u ON u.id = e.student_id
WHERE e.enrolled_class_id = $1 AND e.status = 'active' AND u.is_active
ORDER BY u.full_name, e.student_id;

-- name: EnrolStudent :one
INSERT INTO classes_classenrollment (enrolled_class_id, student_id, status, enrolled_at)
VALUES ($1, $2, 'active', now())
ON CONFLICT (enrolled_class_id, student_id) DO UPDATE SET status = 'active'
RETURNING id, enrolled_class_id, student_id, status, enrolled_at;

-- name: GetEnrollment :one
SELECT e.id, e.enrolled_class_id, e.student_id, c.institution_id
FROM classes_classenrollment e
JOIN classes_class c ON c.id = e.enrolled_class_id
WHERE e.id = $1;

-- name: SuspendEnrollment :exec
UPDATE classes_classenrollment SET status = 'suspended' WHERE id = $1;

-- name: CountLearnerEnrollments :one
SELECT count(*) FROM classes_classenrollment WHERE student_id = ANY(sqlc.arg(learner_ids)::bigint[]);

-- name: ListLearnerEnrollments :many
SELECT e.id, e.enrolled_class_id, c.title AS class_title, e.student_id, u.full_name AS student_name, e.status, e.enrolled_at
FROM classes_classenrollment e
JOIN classes_class c ON c.id = e.enrolled_class_id
JOIN accounts_user u ON u.id = e.student_id
WHERE e.student_id = ANY(sqlc.arg(learner_ids)::bigint[])
ORDER BY c.title, e.id
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: ActiveTerm :one
-- The term a date falls in. When terms overlap, the one marked active wins.
SELECT id FROM scheduling_academicterm
WHERE institution_id = $1 AND start_date <= sqlc.arg(on_date)::date AND end_date >= sqlc.arg(on_date)::date
ORDER BY is_active DESC, start_date DESC
LIMIT 1;

-- name: ActiveRosterIDs :many
SELECT student_id FROM classes_classenrollment
WHERE enrolled_class_id = $1 AND status = 'active';

-- name: UpsertDailyRegister :one
INSERT INTO attendance_dailyregister (institution_id, term_id, student_id, record_date, status, notes, recorded_by_id, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, now())
ON CONFLICT (student_id, record_date) DO UPDATE
  SET status = EXCLUDED.status, notes = EXCLUDED.notes, recorded_by_id = EXCLUDED.recorded_by_id,
      institution_id = EXCLUDED.institution_id, term_id = EXCLUDED.term_id
RETURNING id;

-- name: CountAttendance :one
SELECT count(*)
FROM attendance_dailyregister r
WHERE (r.institution_id = ANY(sqlc.arg(staff_schools)::bigint[]) OR r.student_id = ANY(sqlc.arg(learner_ids)::bigint[]))
  AND (sqlc.narg(on_date)::date IS NULL OR r.record_date = sqlc.narg(on_date)::date)
  AND (sqlc.narg(student_id)::bigint IS NULL OR r.student_id = sqlc.narg(student_id)::bigint)
  AND (sqlc.narg(class_id)::bigint IS NULL OR EXISTS (
        SELECT 1 FROM classes_classenrollment e
        WHERE e.enrolled_class_id = sqlc.narg(class_id)::bigint AND e.student_id = r.student_id));

-- name: ListAttendance :many
SELECT r.id, r.institution_id, r.term_id, t.name AS term_name, r.student_id, u.full_name AS student_name,
       r.record_date, r.status, r.recorded_by_id, rb.full_name AS recorder_name, r.notes, r.created_at
FROM attendance_dailyregister r
JOIN accounts_user u ON u.id = r.student_id
JOIN scheduling_academicterm t ON t.id = r.term_id
LEFT JOIN accounts_user rb ON rb.id = r.recorded_by_id
WHERE (r.institution_id = ANY(sqlc.arg(staff_schools)::bigint[]) OR r.student_id = ANY(sqlc.arg(learner_ids)::bigint[]))
  AND (sqlc.narg(on_date)::date IS NULL OR r.record_date = sqlc.narg(on_date)::date)
  AND (sqlc.narg(student_id)::bigint IS NULL OR r.student_id = sqlc.narg(student_id)::bigint)
  AND (sqlc.narg(class_id)::bigint IS NULL OR EXISTS (
        SELECT 1 FROM classes_classenrollment e
        WHERE e.enrolled_class_id = sqlc.narg(class_id)::bigint AND e.student_id = r.student_id))
ORDER BY r.record_date DESC, u.full_name
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);
