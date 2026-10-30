-- Schools and their memberships. Go owns writes to these tables, and creates
-- accounts for people invited by email who don't have one yet.

-- name: MySchools :many
SELECT DISTINCT i.id, i.name, i.country_code, i.school_level, i.curriculum_track, i.primary_color,
       i.secondary_color, i.subscription_plan, i.is_active, i.created_at
FROM institutions_institution i
JOIN institutions_institutionmembership m ON m.institution_id = i.id
WHERE m.user_id = $1 AND m.status = 'active'
ORDER BY i.name;

-- name: CreateSchool :one
INSERT INTO institutions_institution (name, primary_color, secondary_color, country_code, curriculum_track,
  subscription_plan, is_active, created_at, grade_offerings, school_level, in_grace_period)
VALUES ($1, '#B4402A', '#ffffff', $2, $3, 'trial', true, now(), '[]', $4, false)
RETURNING id;

-- name: UpdateSchool :exec
UPDATE institutions_institution
SET name = COALESCE(sqlc.narg(name), name),
    primary_color = COALESCE(sqlc.narg(primary_color), primary_color)
WHERE id = sqlc.arg(id);

-- name: AddMembership :one
INSERT INTO institutions_institutionmembership (user_id, institution_id, role, status, joined_at)
VALUES ($1, $2, $3, $4, now())
ON CONFLICT (user_id, institution_id, role) DO UPDATE SET status = institutions_institutionmembership.status
RETURNING id;

-- name: UserIDByEmail :one
SELECT id FROM accounts_user WHERE lower(email) = lower(sqlc.arg(email));

-- name: CreateInvitedUser :one
-- '!' is Django's unusable password: the person sets one through password reset.
INSERT INTO accounts_user (password, is_superuser, email, full_name, country_code, role, whatsapp_opt_in,
  is_active, is_staff, date_joined, email_verified)
VALUES ('!', false, lower(sqlc.arg(email)), sqlc.arg(full_name), sqlc.arg(country_code), sqlc.arg(role), false,
  true, false, now(), false)
RETURNING id;

-- name: SchoolCountry :one
SELECT country_code FROM institutions_institution WHERE id = $1;

-- name: ListMemberships :many
-- Leaders see everyone in the schools they lead; everyone sees their own.
SELECT m.id, m.user_id, u.full_name, u.email, m.institution_id, i.name AS institution_name, m.role, m.status, m.joined_at
FROM institutions_institutionmembership m
JOIN accounts_user u ON u.id = m.user_id
JOIN institutions_institution i ON i.id = m.institution_id
WHERE (m.institution_id = ANY(sqlc.arg(leader_schools)::bigint[]) OR m.user_id = sqlc.arg(viewer_id))
  AND (sqlc.narg(school_id)::bigint IS NULL OR m.institution_id = sqlc.narg(school_id)::bigint)
ORDER BY i.name, m.status, u.full_name
LIMIT 1000;

-- name: GetMembership :one
SELECT id, user_id, institution_id, role, status FROM institutions_institutionmembership WHERE id = $1;

-- name: UpdateMembership :exec
UPDATE institutions_institutionmembership
SET role = COALESCE(sqlc.narg(role), role), status = COALESCE(sqlc.narg(status), status)
WHERE id = sqlc.arg(id);

-- name: CountActiveLeaders :one
SELECT count(*) FROM institutions_institutionmembership
WHERE institution_id = $1 AND status = 'active' AND role = ANY(sqlc.arg(leader_roles)::text[]);
