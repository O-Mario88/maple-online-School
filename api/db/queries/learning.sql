-- Assignments, submissions and grades. Go owns writes to these tables.
--
-- Scoping rule used throughout: a person sees work inside the schools where
-- they hold an ACTIVE membership. An assignment belongs to its author's
-- schools; a submission or grade is visible to staff only when both the
-- assignment's author and the student are active in one of the staff
-- member's schools.

-- name: ActiveSchoolIDs :many
SELECT DISTINCT institution_id
FROM institutions_institutionmembership
WHERE user_id = $1 AND status = 'active';

-- name: StaffSchoolIDs :many
SELECT DISTINCT institution_id
FROM institutions_institutionmembership
WHERE user_id = $1
  AND status = 'active'
  AND role = ANY(sqlc.arg(staff_roles)::text[]);

-- name: CountVisibleAssessments :one
SELECT count(*)
FROM assessments_assessment a
WHERE (a.created_by_id = sqlc.arg(viewer_id)
       OR EXISTS (SELECT 1 FROM institutions_institutionmembership m
                  WHERE m.user_id = a.created_by_id AND m.status = 'active'
                    AND m.institution_id = ANY(sqlc.arg(school_ids)::bigint[])))
  AND (NOT sqlc.arg(published_only)::boolean OR a.is_published);

-- name: ListVisibleAssessments :many
SELECT a.id, a.title, a.instructions, a.type, a.source, a.max_score, a.is_published,
       a.created_at, a.created_by_id, a.target_group_id, a.term_id, a.topic_id, a.window_id
FROM assessments_assessment a
WHERE (a.created_by_id = sqlc.arg(viewer_id)
       OR EXISTS (SELECT 1 FROM institutions_institutionmembership m
                  WHERE m.user_id = a.created_by_id AND m.status = 'active'
                    AND m.institution_id = ANY(sqlc.arg(school_ids)::bigint[])))
  AND (NOT sqlc.arg(published_only)::boolean OR a.is_published)
ORDER BY a.created_at DESC, a.id DESC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: GetVisibleAssessment :one
SELECT a.id, a.title, a.instructions, a.type, a.source, a.max_score, a.is_published,
       a.created_at, a.created_by_id, a.target_group_id, a.term_id, a.topic_id, a.window_id
FROM assessments_assessment a
WHERE a.id = sqlc.arg(id)
  AND (a.created_by_id = sqlc.arg(viewer_id)
       OR EXISTS (SELECT 1 FROM institutions_institutionmembership m
                  WHERE m.user_id = a.created_by_id AND m.status = 'active'
                    AND m.institution_id = ANY(sqlc.arg(school_ids)::bigint[])))
  AND (NOT sqlc.arg(published_only)::boolean OR a.is_published);

-- name: CreateAssessment :one
INSERT INTO assessments_assessment (title, instructions, type, source, max_score, is_published, created_by_id, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, now())
RETURNING id, title, instructions, type, source, max_score, is_published,
          created_at, created_by_id, target_group_id, term_id, topic_id, window_id;

-- name: ListQuestions :many
SELECT id, assessment_id, type, content, marks, options, correct_answer, "order"
FROM assessments_question
WHERE assessment_id = ANY(sqlc.arg(assessment_ids)::bigint[])
ORDER BY assessment_id, "order", id;

-- name: CountStudentSubmissions :one
SELECT count(*) FROM assessments_submission WHERE student_id = $1;

-- name: ListStudentSubmissions :many
SELECT s.id, s.assessment_id, s.student_id, s.status, s.submitted_at, s.answers_data, s.total_score,
       a.title AS assessment_title, u.full_name AS student_name
FROM assessments_submission s
JOIN assessments_assessment a ON a.id = s.assessment_id
JOIN accounts_user u ON u.id = s.student_id
WHERE s.student_id = sqlc.arg(student_id)
ORDER BY s.submitted_at DESC NULLS LAST, s.id DESC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: CountStaffSubmissions :one
SELECT count(*)
FROM assessments_submission s
JOIN assessments_assessment a ON a.id = s.assessment_id
WHERE EXISTS (SELECT 1 FROM institutions_institutionmembership ma
              WHERE ma.user_id = a.created_by_id AND ma.status = 'active'
                AND ma.institution_id = ANY(sqlc.arg(school_ids)::bigint[]))
  AND EXISTS (SELECT 1 FROM institutions_institutionmembership ms
              WHERE ms.user_id = s.student_id AND ms.status = 'active'
                AND ms.institution_id = ANY(sqlc.arg(school_ids)::bigint[]));

-- name: ListStaffSubmissions :many
SELECT s.id, s.assessment_id, s.student_id, s.status, s.submitted_at, s.answers_data, s.total_score,
       a.title AS assessment_title, u.full_name AS student_name
FROM assessments_submission s
JOIN assessments_assessment a ON a.id = s.assessment_id
JOIN accounts_user u ON u.id = s.student_id
WHERE EXISTS (SELECT 1 FROM institutions_institutionmembership ma
              WHERE ma.user_id = a.created_by_id AND ma.status = 'active'
                AND ma.institution_id = ANY(sqlc.arg(school_ids)::bigint[]))
  AND EXISTS (SELECT 1 FROM institutions_institutionmembership ms
              WHERE ms.user_id = s.student_id AND ms.status = 'active'
                AND ms.institution_id = ANY(sqlc.arg(school_ids)::bigint[]))
ORDER BY s.submitted_at DESC NULLS LAST, s.id DESC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: LockStudentAssessment :exec
-- Serialises submissions by one student to one assignment, so a double tap
-- or a retry after a dropped connection can't create two submissions.
SELECT pg_advisory_xact_lock(hashtextextended(sqlc.arg(lock_key)::text, 0));

-- name: SubmissionExists :one
SELECT EXISTS (SELECT 1 FROM assessments_submission WHERE assessment_id = $1 AND student_id = $2);

-- name: CreateSubmission :one
INSERT INTO assessments_submission (assessment_id, student_id, status, submitted_at, answers_data, total_score)
VALUES ($1, $2, $3, now(), $4, $5)
RETURNING id, assessment_id, student_id, status, submitted_at, answers_data, total_score;

-- name: GetSubmissionForGrading :one
-- A staff member may grade a submission only when the author and the
-- student are both active in one of the staff member's schools.
SELECT s.id, s.student_id, a.max_score
FROM assessments_submission s
JOIN assessments_assessment a ON a.id = s.assessment_id
WHERE s.id = sqlc.arg(submission_id)
  AND EXISTS (SELECT 1 FROM institutions_institutionmembership ma
              WHERE ma.user_id = a.created_by_id AND ma.status = 'active'
                AND ma.institution_id = ANY(sqlc.arg(school_ids)::bigint[]))
  AND EXISTS (SELECT 1 FROM institutions_institutionmembership ms
              WHERE ms.user_id = s.student_id AND ms.status = 'active'
                AND ms.institution_id = ANY(sqlc.arg(school_ids)::bigint[]));

-- name: UpsertGrade :one
INSERT INTO grading_graderecord (submission_id, score, teacher_feedback, graded_at)
VALUES ($1, $2, $3, now())
ON CONFLICT (submission_id) DO UPDATE
  SET score = EXCLUDED.score, teacher_feedback = EXCLUDED.teacher_feedback, graded_at = now()
RETURNING id, submission_id, score, teacher_feedback, graded_at, (xmax = 0) AS created;

-- name: MarkSubmissionGraded :exec
UPDATE assessments_submission SET status = 'graded' WHERE id = $1;

-- name: CountStudentGrades :one
SELECT count(*)
FROM grading_graderecord g
JOIN assessments_submission s ON s.id = g.submission_id
WHERE s.student_id = ANY(sqlc.arg(student_ids)::bigint[]);

-- name: ListStudentGrades :many
SELECT g.id, g.submission_id, g.score, g.teacher_feedback, g.graded_at,
       s.assessment_id, s.student_id, a.title AS assessment_title, a.max_score, u.full_name AS student_name
FROM grading_graderecord g
JOIN assessments_submission s ON s.id = g.submission_id
JOIN accounts_user u ON u.id = s.student_id
JOIN assessments_assessment a ON a.id = s.assessment_id
WHERE s.student_id = ANY(sqlc.arg(student_ids)::bigint[])
ORDER BY g.graded_at DESC, g.id DESC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: CountStaffGrades :one
SELECT count(*)
FROM grading_graderecord g
JOIN assessments_submission s ON s.id = g.submission_id
JOIN assessments_assessment a ON a.id = s.assessment_id
WHERE EXISTS (SELECT 1 FROM institutions_institutionmembership ma
              WHERE ma.user_id = a.created_by_id AND ma.status = 'active'
                AND ma.institution_id = ANY(sqlc.arg(school_ids)::bigint[]))
  AND EXISTS (SELECT 1 FROM institutions_institutionmembership ms
              WHERE ms.user_id = s.student_id AND ms.status = 'active'
                AND ms.institution_id = ANY(sqlc.arg(school_ids)::bigint[]));

-- name: ListStaffGrades :many
SELECT g.id, g.submission_id, g.score, g.teacher_feedback, g.graded_at,
       s.assessment_id, s.student_id, a.title AS assessment_title, a.max_score, u.full_name AS student_name
FROM grading_graderecord g
JOIN assessments_submission s ON s.id = g.submission_id
JOIN accounts_user u ON u.id = s.student_id
JOIN assessments_assessment a ON a.id = s.assessment_id
WHERE EXISTS (SELECT 1 FROM institutions_institutionmembership ma
              WHERE ma.user_id = a.created_by_id AND ma.status = 'active'
                AND ma.institution_id = ANY(sqlc.arg(school_ids)::bigint[]))
  AND EXISTS (SELECT 1 FROM institutions_institutionmembership ms
              WHERE ms.user_id = s.student_id AND ms.status = 'active'
                AND ms.institution_id = ANY(sqlc.arg(school_ids)::bigint[]))
ORDER BY g.graded_at DESC, g.id DESC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);
