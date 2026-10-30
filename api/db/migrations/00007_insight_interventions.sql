-- +goose Up
-- What a teacher did about a learner who needs them: a message to the family,
-- remedial work, a meeting or a note. Kept as a record the school can review.
CREATE TABLE insight_interventions (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    school_id  bigint      NOT NULL REFERENCES institutions_institution(id),
    class_id   bigint      NOT NULL REFERENCES classes_class(id),
    student_id bigint      NOT NULL REFERENCES accounts_user(id),
    staff_id   bigint      NOT NULL REFERENCES accounts_user(id),
    kind       text        NOT NULL CHECK (kind IN ('parent_message', 'remedial_work', 'meeting', 'note')),
    note       text        NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX insight_interventions_student ON insight_interventions (student_id, created_at DESC);

-- +goose Down
DROP TABLE insight_interventions;
