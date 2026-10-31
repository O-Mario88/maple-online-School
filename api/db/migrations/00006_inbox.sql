-- +goose Up
-- In-app notifications: what happened, a link to act on it, and whether it
-- has been read. Replaces Django's notifications table, which was never used.
CREATE TABLE inbox_notifications (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    bigint      NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    kind       text        NOT NULL,
    title      text        NOT NULL,
    body       text        NOT NULL DEFAULT '',
    link       text        NOT NULL DEFAULT '/',
    created_at timestamptz NOT NULL DEFAULT now(),
    read_at    timestamptz
);

CREATE INDEX inbox_notifications_user ON inbox_notifications (user_id, created_at DESC);
CREATE INDEX inbox_notifications_unread ON inbox_notifications (user_id) WHERE read_at IS NULL;

-- +goose Down
DROP TABLE inbox_notifications;
