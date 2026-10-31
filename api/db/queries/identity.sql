-- name: UserByEmail :one
-- Match case-insensitively so "Student.A@..." and "student.a@..." are the same login.
SELECT id, password, email, full_name, country_code, role, is_active, email_verified
FROM accounts_user
WHERE lower(email) = lower(sqlc.arg(email))
LIMIT 1;

-- name: UserByID :one
SELECT id, password, email, full_name, country_code, role, is_active, email_verified
FROM accounts_user
WHERE id = $1;

-- name: Memberships :many
SELECT m.institution_id, i.name AS institution_name, m.role, m.status
FROM institutions_institutionmembership m
JOIN institutions_institution i ON i.id = m.institution_id
WHERE m.user_id = $1
ORDER BY i.name, m.role;

-- name: ApprovedChildren :many
-- Only approved guardian links count. A matching phone number alone never
-- grants access to a child's records.
SELECT su.id AS user_id, su.full_name, l.relationship_type
FROM parent_portal_parentstudentlink l
JOIN accounts_parentprofile pp ON pp.id = l.parent_profile_id
JOIN accounts_studentprofile sp ON sp.id = l.student_profile_id
JOIN accounts_user su ON su.id = sp.user_id
WHERE pp.user_id = $1
  AND l.consent_status = 'approved'
  AND su.is_active
ORDER BY su.full_name;

-- name: RevokeToken :execrows
INSERT INTO identity_revoked_tokens (token_id, user_id, expires_at)
VALUES ($1, $2, $3)
ON CONFLICT (token_id) DO NOTHING;
