-- +goose Up
-- Who approved or declined each parent-child link, and when. A link grants a
-- parent access to a child's records, so every decision is kept.
CREATE TABLE family_link_decisions (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    link_id    bigint      NOT NULL REFERENCES parent_portal_parentstudentlink(id) ON DELETE CASCADE,
    school_id  bigint      NOT NULL REFERENCES institutions_institution(id),
    decided_by bigint      NOT NULL REFERENCES accounts_user(id),
    decision   text        NOT NULL CHECK (decision IN ('approved', 'declined')),
    decided_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX family_link_decisions_link ON family_link_decisions (link_id);

-- +goose Down
DROP TABLE family_link_decisions;
