-- +goose Up
-- Conversations between a school's staff and a learner's family, about that
-- learner. The school's leaders can read every conversation (safeguarding).
CREATE TABLE msg_threads (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    school_id       bigint      NOT NULL REFERENCES institutions_institution(id),
    student_id      bigint      NOT NULL REFERENCES accounts_user(id),
    staff_id        bigint      NOT NULL REFERENCES accounts_user(id),
    subject         text        NOT NULL,
    created_by      bigint      NOT NULL REFERENCES accounts_user(id),
    created_at      timestamptz NOT NULL DEFAULT now(),
    last_message_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX msg_threads_staff ON msg_threads (staff_id, last_message_at DESC);
CREATE INDEX msg_threads_student ON msg_threads (student_id, last_message_at DESC);
CREATE INDEX msg_threads_school ON msg_threads (school_id, last_message_at DESC);

CREATE TABLE msg_messages (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    thread_id  bigint      NOT NULL REFERENCES msg_threads(id) ON DELETE CASCADE,
    author_id  bigint      NOT NULL REFERENCES accounts_user(id),
    body       text        NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX msg_messages_thread ON msg_messages (thread_id, created_at);

-- +goose Down
DROP TABLE msg_messages;
DROP TABLE msg_threads;
