-- The School Network. Go owns the network_* tables (migration 00009).
-- A school is listed only when it is active, verified by Maple and published.
-- Counts about the people who look at a school are hidden below a minimum
-- cohort here, in the queries, so no caller can read a small raw figure.

-- name: ListProfiles :many
SELECT p.school_id, p.slug, i.name, p.town, p.district, p.curricula, p.levels, p.stay, p.mode, p.programs, p.facilities,
       p.blurb, p.pass_rate, p.pass_board, p.pass_exam, p.pass_year, p.pass_source, p.learners, p.established, p.scholarships,
       p.admissions_opens, p.admissions_deadline, p.fee_min_ugx, p.fee_max_ugx, p.requirements,
       p.apply_intake, p.apply_fee_ugx, p.apply_programs, p.apply_documents, p.published_at::timestamptz AS listed_at,
       network_cohort_total(v.total, sqlc.arg(min_cohort)::bigint) AS views,
       count(*) OVER () AS total_count
FROM network_profiles p
JOIN institutions_institution i ON i.id = p.school_id
CROSS JOIN LATERAL (SELECT COALESCE(sum(pv.views), 0)::bigint AS total FROM network_profile_views pv WHERE pv.school_id = p.school_id) v
WHERE i.is_active AND p.verified_at IS NOT NULL AND p.published_at IS NOT NULL
  AND (sqlc.arg(district)::text = '' OR p.district = sqlc.arg(district)::text)
  AND (sqlc.arg(curriculum)::text = '' OR sqlc.arg(curriculum)::text = ANY(p.curricula))
  AND (sqlc.arg(level)::text = '' OR sqlc.arg(level)::text = ANY(p.levels))
  AND (sqlc.arg(category)::text = ''
       OR (sqlc.arg(category)::text = 'top' AND p.pass_rate >= sqlc.arg(top_pass_rate)::int)
       OR (sqlc.arg(category)::text = 'online' AND p.mode <> 'Physical')
       OR (sqlc.arg(category)::text = 'boarding' AND p.stay <> 'Day')
       OR (sqlc.arg(category)::text = 'scholarships' AND p.scholarships))
  AND (sqlc.arg(query)::text = ''
       OR EXISTS (SELECT 1 FROM unnest(ARRAY[i.name::text, p.town, p.district] || p.curricula || p.levels || p.programs) AS word
                  WHERE position(lower(sqlc.arg(query)::text) IN lower(word)) > 0))
ORDER BY i.name, p.school_id
LIMIT sqlc.arg(page_limit)::int OFFSET sqlc.arg(page_offset)::int;

-- name: GetProfile :one
-- The same columns as ListProfiles, so both read into one Go type.
SELECT p.school_id, p.slug, i.name, p.town, p.district, p.curricula, p.levels, p.stay, p.mode, p.programs, p.facilities,
       p.blurb, p.pass_rate, p.pass_board, p.pass_exam, p.pass_year, p.pass_source, p.learners, p.established, p.scholarships,
       p.admissions_opens, p.admissions_deadline, p.fee_min_ugx, p.fee_max_ugx, p.requirements,
       p.apply_intake, p.apply_fee_ugx, p.apply_programs, p.apply_documents, p.published_at::timestamptz AS listed_at,
       network_cohort_total(v.total, sqlc.arg(min_cohort)::bigint) AS views,
       1::bigint AS total_count
FROM network_profiles p
JOIN institutions_institution i ON i.id = p.school_id
CROSS JOIN LATERAL (SELECT COALESCE(sum(pv.views), 0)::bigint AS total FROM network_profile_views pv WHERE pv.school_id = p.school_id) v
WHERE p.school_id = sqlc.arg(school_id)::bigint
  AND i.is_active AND p.verified_at IS NOT NULL AND p.published_at IS NOT NULL;

-- name: ExamCentres :many
-- Verified exam centres among the given schools.
SELECT school_id, boards, exams, external, register_by, fee_ugx
FROM network_exam_centres
WHERE school_id = ANY(sqlc.arg(school_ids)::bigint[]) AND verified_at IS NOT NULL;

-- name: SchoolVacancies :many
-- Open vacancies among the given schools.
SELECT id, school_id, title, kind, closes_on, subjects
FROM network_vacancies
WHERE school_id = ANY(sqlc.arg(school_ids)::bigint[]) AND closes_on >= current_date
ORDER BY closes_on, id;

-- name: IsListed :one
SELECT EXISTS (SELECT 1 FROM network_profiles p JOIN institutions_institution i ON i.id = p.school_id
               WHERE p.school_id = $1 AND i.is_active AND p.verified_at IS NOT NULL AND p.published_at IS NOT NULL);

-- name: RecordView :exec
-- Adds one to today's view count. The viewer is used only to skip the
-- school's own people and is not stored.
INSERT INTO network_profile_views (school_id, day, views)
SELECT sqlc.arg(school_id)::bigint, current_date, 1
WHERE NOT EXISTS (SELECT 1 FROM institutions_institutionmembership m
                  WHERE m.institution_id = sqlc.arg(school_id)::bigint AND m.user_id = sqlc.arg(viewer)::bigint)
ON CONFLICT (school_id, day) DO UPDATE SET views = network_profile_views.views + 1;

-- name: MySaves :many
SELECT school_id, created_at FROM network_saves WHERE user_id = $1 ORDER BY created_at DESC;

-- name: SaveSchool :exec
INSERT INTO network_saves (user_id, school_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;

-- name: UnsaveSchool :exec
DELETE FROM network_saves WHERE user_id = $1 AND school_id = $2;

-- name: MyApplications :many
SELECT a.id, a.school_id, i.name AS school_name, a.status, a.shared, a.started_at, a.submitted_at
FROM network_applications a
JOIN institutions_institution i ON i.id = a.school_id
WHERE a.user_id = $1
ORDER BY a.started_at DESC, a.id DESC;

-- name: InsertApplication :one
-- Starts an application; returns no row when one already exists.
INSERT INTO network_applications (school_id, user_id) VALUES ($1, $2)
ON CONFLICT (school_id, user_id) DO NOTHING
RETURNING id;

-- name: ApplicationFor :one
SELECT id FROM network_applications WHERE school_id = $1 AND user_id = $2;

-- name: MyApplication :one
SELECT a.id, a.school_id, i.name AS school_name, a.status, a.shared, a.started_at, a.submitted_at
FROM network_applications a
JOIN institutions_institution i ON i.id = a.school_id
WHERE a.id = $1 AND a.user_id = $2;

-- name: SubmitApplication :execrows
UPDATE network_applications
SET status = 'submitted', shared = $3, consent_text = $4, consented_at = now(), submitted_at = now()
WHERE id = $1 AND user_id = $2 AND status = 'started';

-- name: SchoolTotals :one
-- Totals for a school's own leaders. Each figure is NULL below min_cohort.
-- Enrolments are submitted applicants who later joined the school as students.
WITH t AS (
    SELECT
        (SELECT COALESCE(sum(views), 0) FROM network_profile_views WHERE school_id = sqlc.arg(school_id)::bigint)::bigint AS views,
        (SELECT count(*) FROM network_saves WHERE school_id = sqlc.arg(school_id)::bigint) AS saves,
        (SELECT count(*) FROM network_applications WHERE school_id = sqlc.arg(school_id)::bigint) AS starts,
        (SELECT count(*) FROM network_applications WHERE school_id = sqlc.arg(school_id)::bigint AND status = 'submitted') AS submissions,
        (SELECT count(DISTINCT a.user_id) FROM network_applications a
         JOIN institutions_institutionmembership m
           ON m.user_id = a.user_id AND m.institution_id = a.school_id AND m.role = 'student' AND m.status = 'active'
          AND m.joined_at >= a.submitted_at
         WHERE a.school_id = sqlc.arg(school_id)::bigint AND a.status = 'submitted') AS enrolments
)
SELECT network_cohort_total(views, sqlc.arg(min_cohort)::bigint) AS profile_views,
       network_cohort_total(saves, sqlc.arg(min_cohort)::bigint) AS saves,
       network_cohort_total(starts, sqlc.arg(min_cohort)::bigint) AS application_starts,
       network_cohort_total(submissions, sqlc.arg(min_cohort)::bigint) AS application_submissions,
       network_cohort_total(enrolments, sqlc.arg(min_cohort)::bigint) AS enrolments
FROM t;

-- name: ApplyForm :one
-- What a school's application form asks for, to check a submission against.
SELECT apply_programs, apply_documents FROM network_profiles WHERE school_id = $1;

-- name: HasProfile :one
SELECT EXISTS (SELECT 1 FROM network_profiles WHERE school_id = $1);
