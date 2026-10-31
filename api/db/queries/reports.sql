-- Subject marks and term report cards. Go owns writes to these tables.
--
-- Staff see everything in their schools. Students and approved parents see
-- marks and report cards only once the term's report card is published.

-- name: ClassBasics :one
SELECT id, institution_id, teacher_id, title FROM classes_class WHERE id = $1;

-- name: TermInSchool :one
SELECT EXISTS (SELECT 1 FROM scheduling_academicterm WHERE id = $1 AND institution_id = $2);

-- name: ReportPublished :one
SELECT EXISTS (SELECT 1 FROM grading_reportcard WHERE student_id = $1 AND term_id = $2 AND is_published);

-- name: UpsertSubjectGrade :exec
INSERT INTO grading_subjectgrade (student_id, assigned_class_id, term_id, formative_score, summative_score,
  total_score, grade_letter, descriptor, teacher_remarks, finalized_by_id, finalized_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
ON CONFLICT (student_id, assigned_class_id, term_id) DO UPDATE
  SET formative_score = EXCLUDED.formative_score, summative_score = EXCLUDED.summative_score,
      total_score = EXCLUDED.total_score, grade_letter = EXCLUDED.grade_letter,
      descriptor = EXCLUDED.descriptor, teacher_remarks = EXCLUDED.teacher_remarks,
      finalized_by_id = EXCLUDED.finalized_by_id, finalized_at = now();

-- name: CountSubjectMarks :one
SELECT count(*)
FROM grading_subjectgrade g
JOIN classes_class c ON c.id = g.assigned_class_id
WHERE (c.institution_id = ANY(sqlc.arg(staff_schools)::bigint[])
       OR (g.student_id = ANY(sqlc.arg(learner_ids)::bigint[])
           AND EXISTS (SELECT 1 FROM grading_reportcard r
                       WHERE r.student_id = g.student_id AND r.term_id = g.term_id AND r.is_published)))
  AND (sqlc.narg(class_id)::bigint IS NULL OR g.assigned_class_id = sqlc.narg(class_id)::bigint)
  AND (sqlc.narg(term_id)::bigint IS NULL OR g.term_id = sqlc.narg(term_id)::bigint)
  AND (sqlc.narg(student_id)::bigint IS NULL OR g.student_id = sqlc.narg(student_id)::bigint);

-- name: ListSubjectMarks :many
SELECT g.id, g.student_id, u.full_name AS student_name, g.assigned_class_id, c.title AS class_title,
       g.term_id, t.name AS term_name, g.formative_score, g.summative_score, g.total_score,
       g.grade_letter, g.descriptor, g.teacher_remarks, g.finalized_by_id, g.finalized_at
FROM grading_subjectgrade g
JOIN classes_class c ON c.id = g.assigned_class_id
JOIN accounts_user u ON u.id = g.student_id
JOIN scheduling_academicterm t ON t.id = g.term_id
WHERE (c.institution_id = ANY(sqlc.arg(staff_schools)::bigint[])
       OR (g.student_id = ANY(sqlc.arg(learner_ids)::bigint[])
           AND EXISTS (SELECT 1 FROM grading_reportcard r
                       WHERE r.student_id = g.student_id AND r.term_id = g.term_id AND r.is_published)))
  AND (sqlc.narg(class_id)::bigint IS NULL OR g.assigned_class_id = sqlc.narg(class_id)::bigint)
  AND (sqlc.narg(term_id)::bigint IS NULL OR g.term_id = sqlc.narg(term_id)::bigint)
  AND (sqlc.narg(student_id)::bigint IS NULL OR g.student_id = sqlc.narg(student_id)::bigint)
ORDER BY t.start_date DESC, c.title, u.full_name
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: StudentTermAverage :one
-- Average of the student's subject totals for the term, within one school.
SELECT COALESCE(avg(g.total_score), 0)::float8 AS average, count(g.total_score) AS subjects
FROM grading_subjectgrade g
JOIN classes_class c ON c.id = g.assigned_class_id
WHERE g.student_id = $1 AND g.term_id = $2 AND c.institution_id = $3;

-- name: UpsertDraftReport :execrows
-- Never touches a report card that has been published.
INSERT INTO grading_reportcard (institution_id, student_id, term_id, overall_score, overall_grade_letter,
  is_published, generated_at)
VALUES ($1, $2, $3, $4, $5, false, now())
ON CONFLICT (student_id, term_id) DO UPDATE
  SET overall_score = EXCLUDED.overall_score, overall_grade_letter = EXCLUDED.overall_grade_letter,
      generated_at = now()
  WHERE NOT grading_reportcard.is_published;

-- name: CountReports :one
SELECT count(*)
FROM grading_reportcard r
WHERE (r.institution_id = ANY(sqlc.arg(staff_schools)::bigint[])
       OR (r.student_id = ANY(sqlc.arg(learner_ids)::bigint[]) AND r.is_published))
  AND (sqlc.narg(term_id)::bigint IS NULL OR r.term_id = sqlc.narg(term_id)::bigint)
  AND (sqlc.narg(student_id)::bigint IS NULL OR r.student_id = sqlc.narg(student_id)::bigint);

-- name: ListReports :many
SELECT r.id, r.institution_id, r.student_id, u.full_name AS student_name, r.term_id, t.name AS term_name,
       r.overall_score, r.overall_grade_letter, r.promotion_status, r.class_teacher_remarks,
       r.headteacher_remarks, r.is_published, r.published_at, r.generated_at
FROM grading_reportcard r
JOIN accounts_user u ON u.id = r.student_id
JOIN scheduling_academicterm t ON t.id = r.term_id
WHERE (r.institution_id = ANY(sqlc.arg(staff_schools)::bigint[])
       OR (r.student_id = ANY(sqlc.arg(learner_ids)::bigint[]) AND r.is_published))
  AND (sqlc.narg(term_id)::bigint IS NULL OR r.term_id = sqlc.narg(term_id)::bigint)
  AND (sqlc.narg(student_id)::bigint IS NULL OR r.student_id = sqlc.narg(student_id)::bigint)
ORDER BY t.start_date DESC, u.full_name
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: GetReport :one
SELECT r.id, r.institution_id, r.student_id, u.full_name AS student_name, r.term_id, t.name AS term_name,
       r.overall_score, r.overall_grade_letter, r.promotion_status, r.class_teacher_remarks,
       r.headteacher_remarks, r.is_published, r.published_at, r.generated_at
FROM grading_reportcard r
JOIN accounts_user u ON u.id = r.student_id
JOIN scheduling_academicterm t ON t.id = r.term_id
WHERE r.id = sqlc.arg(id)
  AND (r.institution_id = ANY(sqlc.arg(staff_schools)::bigint[])
       OR (r.student_id = ANY(sqlc.arg(learner_ids)::bigint[]) AND r.is_published));

-- name: UpdateReport :exec
UPDATE grading_reportcard
SET class_teacher_remarks = COALESCE(sqlc.narg(class_teacher_remarks), class_teacher_remarks),
    headteacher_remarks = COALESCE(sqlc.narg(headteacher_remarks), headteacher_remarks),
    promotion_status = COALESCE(sqlc.narg(promotion_status), promotion_status),
    published_at = CASE WHEN sqlc.narg(is_published)::boolean AND NOT is_published THEN now()
                        WHEN sqlc.narg(is_published)::boolean = false THEN NULL
                        ELSE published_at END,
    is_published = COALESCE(sqlc.narg(is_published), is_published)
WHERE id = sqlc.arg(id);
