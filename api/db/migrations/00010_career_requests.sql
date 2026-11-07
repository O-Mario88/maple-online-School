-- +goose Up
-- Learners' Career Compass requests to Maple's career team: an event they'd
-- like ("suggest an event") or a community to start. Numbered 00010 because
-- another branch adds 00009 (School Network).
CREATE TABLE career_requests (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    bigint      NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    kind       text        NOT NULL CHECK (kind IN ('event', 'community')),
    body       text        NOT NULL CHECK (length(body) BETWEEN 3 AND 500),
    status     text        NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'planned', 'declined')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX career_requests_user ON career_requests (user_id, created_at DESC);
CREATE INDEX career_requests_status ON career_requests (status, created_at DESC);

-- +goose Down
DROP TABLE career_requests;
