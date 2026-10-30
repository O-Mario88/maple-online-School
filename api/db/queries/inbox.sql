-- In-app notifications. Go owns inbox_notifications (migration 00006).

-- name: AddNotification :exec
INSERT INTO inbox_notifications (user_id, kind, title, body, link) VALUES ($1, $2, $3, $4, $5);

-- name: AddFamilyNotification :exec
-- The learner and every parent whose link to them is approved.
INSERT INTO inbox_notifications (user_id, kind, title, body, link)
SELECT r.user_id, sqlc.arg(kind)::text, sqlc.arg(title)::text, sqlc.arg(body)::text, sqlc.arg(link)::text
FROM (
    SELECT sqlc.arg(student)::bigint AS user_id
    UNION
    SELECT pp.user_id
    FROM parent_portal_parentstudentlink l
    JOIN accounts_parentprofile pp ON pp.id = l.parent_profile_id
    JOIN accounts_studentprofile sp ON sp.id = l.student_profile_id
    WHERE sp.user_id = sqlc.arg(student)::bigint AND l.consent_status = 'approved'
) r;

-- name: ListNotifications :many
SELECT id, kind, title, body, link, created_at, read_at
FROM inbox_notifications
WHERE user_id = sqlc.arg(user_id)::bigint AND (NOT sqlc.arg(unread_only)::boolean OR read_at IS NULL)
ORDER BY created_at DESC, id DESC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);

-- name: CountNotifications :one
SELECT count(*) FROM inbox_notifications
WHERE user_id = sqlc.arg(user_id)::bigint AND (NOT sqlc.arg(unread_only)::boolean OR read_at IS NULL);

-- name: UnreadNotifications :one
SELECT count(*) FROM inbox_notifications WHERE user_id = $1 AND read_at IS NULL;

-- name: MarkNotificationRead :execrows
UPDATE inbox_notifications SET read_at = COALESCE(read_at, now()) WHERE id = $1 AND user_id = $2;

-- name: MarkAllNotificationsRead :exec
UPDATE inbox_notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL;
