-- Learner insights and interventions. Go owns insight_interventions (migration 00007).

-- name: InsightClass :one
SELECT c.id, c.title, c.institution_id, c.teacher_id FROM classes_class c WHERE c.id = $1;

-- name: ClassLearnerSignals :many
-- For each active learner: days marked and attended at the class's school
-- since a date, the class teacher's published work set and handed in, the
-- share of marks earned on marked work, and when someone last intervened.
SELECT u.id AS student_id, u.full_name,
       (SELECT count(*) FROM attendance_dailyregister r
        WHERE r.student_id = u.id AND r.institution_id = sqlc.arg(school_id)::bigint AND r.record_date >= sqlc.arg(since)::date)::int AS days_marked,
       (SELECT count(*) FROM attendance_dailyregister r
        WHERE r.student_id = u.id AND r.institution_id = sqlc.arg(school_id)::bigint AND r.record_date >= sqlc.arg(since)::date
          AND r.status IN ('present', 'late'))::int AS days_attended,
       (SELECT count(*) FROM assessments_assessment a
        WHERE a.created_by_id = sqlc.arg(teacher_id)::bigint AND a.is_published)::int AS work_set,
       (SELECT count(*) FROM assessments_submission s JOIN assessments_assessment a ON a.id = s.assessment_id
        WHERE s.student_id = u.id AND a.created_by_id = sqlc.arg(teacher_id)::bigint AND a.is_published)::int AS work_done,
       -- -1 when nothing has been marked yet.
       COALESCE((SELECT sum(g.score) / NULLIF(sum(a.max_score), 0) FROM grading_graderecord g
        JOIN assessments_submission s ON s.id = g.submission_id JOIN assessments_assessment a ON a.id = s.assessment_id
        WHERE s.student_id = u.id AND a.created_by_id = sqlc.arg(teacher_id)::bigint), -1)::float8 AS average,
       (SELECT max(i.created_at) FROM insight_interventions i WHERE i.student_id = u.id)::timestamptz AS last_intervention_at
FROM classes_classenrollment e
JOIN accounts_user u ON u.id = e.student_id
WHERE e.enrolled_class_id = sqlc.arg(class_id)::bigint AND e.status = 'active'
ORDER BY u.full_name;

-- name: EnrolledInClass :one
SELECT EXISTS (SELECT 1 FROM classes_classenrollment
               WHERE enrolled_class_id = $1 AND student_id = $2 AND status = 'active');

-- name: CreateIntervention :one
INSERT INTO insight_interventions (school_id, class_id, student_id, staff_id, kind, note)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, created_at;

-- name: ListInterventions :many
-- A learner's interventions, for staff who lead their school or teach them.
SELECT i.id, i.class_id, c.title AS class_title, i.student_id, i.staff_id, u.full_name AS staff_name,
       i.kind, i.note, i.created_at
FROM insight_interventions i
JOIN classes_class c ON c.id = i.class_id
JOIN accounts_user u ON u.id = i.staff_id
WHERE i.student_id = sqlc.arg(student_id)::bigint
  AND (i.school_id = ANY(sqlc.arg(leader_schools)::bigint[])
       OR EXISTS (SELECT 1 FROM classes_class tc JOIN classes_classenrollment te ON te.enrolled_class_id = tc.id
                  WHERE tc.teacher_id = sqlc.arg(viewer_id)::bigint AND te.student_id = i.student_id AND te.status = 'active'))
ORDER BY i.created_at DESC, i.id DESC
LIMIT 100;
