-- +goose Up
-- Zero-collision live scheduling (playbook section 15, pattern 1). Every live
-- session holds a time range for its teacher and its class; Postgres rejects
-- any overlap, so two requests racing for the same hour can't both win.
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE live_reservations (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id bigint UNIQUE REFERENCES live_sessions_livesession(id) ON DELETE CASCADE,
    teacher_id bigint NOT NULL,
    cohort_id  bigint,
    slot       tstzrange NOT NULL CHECK (NOT isempty(slot)),
    source     text NOT NULL DEFAULT 'maple_live' CHECK (source IN ('maple_live', 'external_calendar_sync')),
    status     text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'held', 'cancelled')),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT live_reservations_teacher_free EXCLUDE USING gist (teacher_id WITH =, slot WITH &&)
        WHERE (status IN ('confirmed', 'held')),
    CONSTRAINT live_reservations_cohort_free EXCLUDE USING gist (cohort_id WITH =, slot WITH &&)
        WHERE (cohort_id IS NOT NULL AND status IN ('confirmed', 'held'))
);

-- Existing scheduled sessions take their slots; any that already clash are
-- left without one (DO NOTHING) rather than failing the migration.
INSERT INTO live_reservations (session_id, teacher_id, cohort_id, slot)
SELECT s.id, c.teacher_id, c.id,
       tstzrange(s.scheduled_start, s.scheduled_start + make_interval(mins => s.duration_minutes), '[)')
FROM live_sessions_livesession s
JOIN lessons_lesson l ON l.id = s.lesson_id
JOIN classes_class c ON c.id = l.parent_class_id
WHERE s.status = 'scheduled' AND s.scheduled_start IS NOT NULL
ORDER BY s.scheduled_start, s.id
ON CONFLICT DO NOTHING;

-- +goose Down
DROP TABLE live_reservations;
