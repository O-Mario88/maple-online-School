-- Sign-up, email verification and password reset. Go owns these writes.

-- name: EmailTaken :one
SELECT EXISTS (SELECT 1 FROM accounts_user WHERE lower(email) = lower(sqlc.arg(email)::text));

-- name: CreateAccount :one
INSERT INTO accounts_user (password, is_superuser, email, full_name, country_code, role, whatsapp_opt_in,
  is_active, is_staff, date_joined, email_verified)
VALUES (sqlc.arg(password), false, lower(sqlc.arg(email)), sqlc.arg(full_name), sqlc.arg(country_code),
  sqlc.arg(role), false, true, false, now(), false)
RETURNING id;

-- name: CreateStudentProfile :one
INSERT INTO accounts_studentprofile (onboarding_status, user_id) VALUES ('pending', $1) RETURNING id;

-- name: CreateTeacherProfile :exec
INSERT INTO accounts_teacherprofile (verification_status, bio, years_of_experience, user_id)
VALUES ('unverified', '', 0, $1);

-- name: CreateInstitutionAdminProfile :exec
INSERT INTO accounts_institutionadminprofile (user_id) VALUES ($1);

-- name: CreateParentProfile :one
INSERT INTO accounts_parentprofile (user_id) VALUES ($1) RETURNING id;

-- name: ParentProfileByEmail :one
SELECT p.id, u.id AS user_id
FROM accounts_parentprofile p JOIN accounts_user u ON u.id = p.user_id
WHERE lower(u.email) = lower(sqlc.arg(email)::text) AND u.role = 'parent';

-- name: LinkParent :exec
INSERT INTO parent_portal_parentstudentlink (relationship_type, consent_status, linked_at, parent_profile_id, student_profile_id)
VALUES (sqlc.arg(relationship_type), sqlc.arg(consent_status), now(), sqlc.arg(parent_profile_id), sqlc.arg(student_profile_id));

-- name: AccountForLink :one
-- What a signed link is checked against: changing the password or verifying
-- the email changes the fingerprint, so each link works once.
SELECT id, email, full_name, password, email_verified, is_active
FROM accounts_user WHERE id = $1;

-- name: AccountByEmailForLink :one
SELECT id, email, full_name, password, email_verified, is_active
FROM accounts_user WHERE lower(email) = lower(sqlc.arg(email)::text);

-- name: MarkEmailVerified :exec
UPDATE accounts_user SET email_verified = true, email_verified_at = COALESCE(email_verified_at, now())
WHERE id = $1;

-- name: SetAccountPassword :exec
-- Finishing a reset also proves the person owns the email address.
UPDATE accounts_user SET password = $2, email_verified = true,
  email_verified_at = COALESCE(email_verified_at, now())
WHERE id = $1;
