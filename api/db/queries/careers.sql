-- Career Compass requests. Go owns career_requests (migration 00010).

-- name: AddCareerRequest :one
INSERT INTO career_requests (user_id, kind, body) VALUES ($1, $2, $3)
RETURNING id, kind, body, status, created_at;

-- name: MyCareerRequests :many
SELECT id, kind, body, status, created_at
FROM career_requests
WHERE user_id = sqlc.arg(user_id)::bigint
ORDER BY created_at DESC, id DESC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: CountMyCareerRequests :one
SELECT count(*) FROM career_requests WHERE user_id = $1;

-- name: AllCareerRequests :many
-- For Maple's career team: who asked is shown by first name only.
SELECT r.id, r.kind, r.body, r.status, r.created_at, split_part(u.full_name, ' ', 1)::text AS first_name
FROM career_requests r
JOIN accounts_user u ON u.id = r.user_id
WHERE sqlc.arg(status)::text = '' OR r.status = sqlc.arg(status)::text
ORDER BY r.created_at DESC, r.id DESC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: CountAllCareerRequests :one
SELECT count(*) FROM career_requests WHERE sqlc.arg(status)::text = '' OR status = sqlc.arg(status)::text;

-- name: SetCareerRequestStatus :execrows
UPDATE career_requests SET status = $2, updated_at = now() WHERE id = $1;

-- name: IsMapleStaff :one
SELECT is_staff FROM accounts_user WHERE id = $1;
