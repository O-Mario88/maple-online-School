-- Parent-child links (Django's parent_portal table) and their approval.
-- Go owns family_link_decisions (migration 00005).

-- name: FamilyLinks :many
-- Links a person can see: for admissions staff, those of students at their
-- schools; for a parent, their own. Newest first.
SELECT l.id, l.relationship_type, l.consent_status, l.linked_at,
       pu.id AS parent_id, pu.full_name AS parent_name, pu.email AS parent_email,
       su.id AS student_id, su.full_name AS student_name,
       COALESCE(m.institution_id, 0)::bigint AS school_id, COALESCE(i.name, '')::text AS school_name
FROM parent_portal_parentstudentlink l
JOIN accounts_parentprofile pp ON pp.id = l.parent_profile_id
JOIN accounts_user pu ON pu.id = pp.user_id
JOIN accounts_studentprofile sp ON sp.id = l.student_profile_id
JOIN accounts_user su ON su.id = sp.user_id
LEFT JOIN LATERAL (
    SELECT mm.institution_id FROM institutions_institutionmembership mm
    WHERE mm.user_id = su.id AND mm.role = 'student' AND mm.status = 'active'
      AND (cardinality(sqlc.arg(schools)::bigint[]) = 0 OR mm.institution_id = ANY(sqlc.arg(schools)::bigint[]))
    ORDER BY mm.institution_id LIMIT 1
) m ON true
LEFT JOIN institutions_institution i ON i.id = m.institution_id
WHERE ((cardinality(sqlc.arg(schools)::bigint[]) > 0 AND m.institution_id IS NOT NULL) OR pu.id = sqlc.arg(parent)::bigint)
  AND (sqlc.narg(status)::text IS NULL OR l.consent_status = sqlc.narg(status)::text)
  AND (sqlc.narg(link)::bigint IS NULL OR l.id = sqlc.narg(link)::bigint)
ORDER BY l.linked_at DESC, l.id DESC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: CountFamilyLinks :one
SELECT count(*)
FROM parent_portal_parentstudentlink l
JOIN accounts_parentprofile pp ON pp.id = l.parent_profile_id
JOIN accounts_studentprofile sp ON sp.id = l.student_profile_id
WHERE ((cardinality(sqlc.arg(schools)::bigint[]) > 0 AND EXISTS (
          SELECT 1 FROM institutions_institutionmembership mm
          WHERE mm.user_id = sp.user_id AND mm.role = 'student' AND mm.status = 'active'
            AND mm.institution_id = ANY(sqlc.arg(schools)::bigint[])))
       OR pp.user_id = sqlc.arg(parent)::bigint)
  AND (sqlc.narg(status)::text IS NULL OR l.consent_status = sqlc.narg(status)::text);

-- name: LockFamilyLink :one
SELECT l.id, l.consent_status, pp.user_id AS parent_id, sp.user_id AS student_id
FROM parent_portal_parentstudentlink l
JOIN accounts_parentprofile pp ON pp.id = l.parent_profile_id
JOIN accounts_studentprofile sp ON sp.id = l.student_profile_id
WHERE l.id = $1
FOR UPDATE OF l;

-- name: StudentSchoolsAmong :many
-- The given schools where the student is an active learner.
SELECT institution_id FROM institutions_institutionmembership
WHERE user_id = $1 AND role = 'student' AND status = 'active'
  AND institution_id = ANY(sqlc.arg(schools)::bigint[])
ORDER BY institution_id;

-- name: SetFamilyLinkStatus :exec
UPDATE parent_portal_parentstudentlink SET consent_status = $2 WHERE id = $1;

-- name: RecordFamilyLinkDecision :exec
INSERT INTO family_link_decisions (link_id, school_id, decided_by, decision) VALUES ($1, $2, $3, $4);
