-- +goose Up
-- Refresh tokens that have been used or logged out. Each refresh token works
-- once; rows can be deleted after expires_at.
CREATE TABLE identity_revoked_tokens (
    token_id   text        PRIMARY KEY,
    user_id    bigint      NOT NULL,
    revoked_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL
);

CREATE INDEX identity_revoked_tokens_expires_at_idx ON identity_revoked_tokens (expires_at);

-- +goose Down
DROP TABLE identity_revoked_tokens;
