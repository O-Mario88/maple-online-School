-- +goose Up
-- The School Network: verified Maple schools that independent learners and
-- teachers can discover, save and apply to.
--
-- Privacy rules (owner, Nov 2026): a school sees only totals about the people
-- who look at it, never who. Profile views are kept as daily counters with no
-- user at all. Saves and applications name the user because they are that
-- user's own records; the API only ever counts them for a school. A school
-- learns who someone is only from an application that person submitted, with
-- their consent recorded.

-- A school's public profile. It is listed only when the school is active,
-- Maple has verified it and the school has published the profile.
CREATE TABLE network_profiles (
    school_id           bigint      PRIMARY KEY REFERENCES institutions_institution(id) ON DELETE CASCADE,
    slug                text        NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    town                text        NOT NULL,
    district            text        NOT NULL,
    curricula           text[]      NOT NULL DEFAULT '{}',
    levels              text[]      NOT NULL DEFAULT '{}',
    stay                text        NOT NULL CHECK (stay IN ('Day', 'Boarding', 'Day & Boarding')),
    mode                text        NOT NULL CHECK (mode IN ('Physical', 'Hybrid', 'Online')),
    programs            text[]      NOT NULL DEFAULT '{}',
    facilities          text[]      NOT NULL DEFAULT '{}',
    blurb               text        NOT NULL CHECK (length(blurb) <= 600),
    -- The published pass rate and where it comes from, e.g. 96% at UNEB UCE 2025.
    pass_rate           smallint    CHECK (pass_rate BETWEEN 0 AND 100),
    pass_board          text,
    pass_exam           text,
    pass_year           smallint,
    pass_source         text,
    learners            integer     NOT NULL DEFAULT 0 CHECK (learners >= 0),
    established         smallint,
    scholarships        boolean     NOT NULL DEFAULT false,
    -- No opening date means admissions are open all year; no deadline means rolling.
    admissions_opens    date,
    admissions_deadline date,
    fee_min_ugx         bigint      CHECK (fee_min_ugx >= 0),
    fee_max_ugx         bigint      CHECK (fee_max_ugx >= fee_min_ugx),
    requirements        text[]      NOT NULL DEFAULT '{}',
    -- The school's application form: the intake, its application fee, what
    -- applicants can apply for, and the documents it needs ([{"id","label"}]).
    apply_intake        text,
    apply_fee_ugx       bigint      CHECK (apply_fee_ugx >= 0),
    apply_programs      text[]      NOT NULL DEFAULT '{}',
    apply_documents     jsonb       NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(apply_documents) = 'array'),
    verified_at         timestamptz,
    verified_by         bigint      REFERENCES accounts_user(id),
    published_at        timestamptz,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CHECK (pass_rate IS NULL OR (pass_exam IS NOT NULL AND pass_year IS NOT NULL AND pass_source IS NOT NULL))
);

-- An exam centre is shown only once Maple has verified it with the exam board.
-- Being a Maple school does not make a school an exam centre.
CREATE TABLE network_exam_centres (
    school_id   bigint      PRIMARY KEY REFERENCES network_profiles(school_id) ON DELETE CASCADE,
    boards      text[]      NOT NULL,
    exams       text[]      NOT NULL,
    external    boolean     NOT NULL DEFAULT false,
    register_by date,
    fee_ugx     bigint      CHECK (fee_ugx >= 0),
    verified_at timestamptz,
    verified_by bigint      REFERENCES accounts_user(id)
);

CREATE TABLE network_vacancies (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    school_id  bigint      NOT NULL REFERENCES network_profiles(school_id) ON DELETE CASCADE,
    title      text        NOT NULL,
    kind       text        NOT NULL,
    closes_on  date        NOT NULL,
    subjects   text[]      NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX network_vacancies_open ON network_vacancies (closes_on);

-- Profile views per school per day. There is deliberately no user column.
CREATE TABLE network_profile_views (
    school_id bigint  NOT NULL REFERENCES network_profiles(school_id) ON DELETE CASCADE,
    day       date    NOT NULL DEFAULT current_date,
    views     integer NOT NULL DEFAULT 0 CHECK (views >= 0),
    PRIMARY KEY (school_id, day)
);

-- A user's own saved schools, private to them.
CREATE TABLE network_saves (
    user_id    bigint      NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    school_id  bigint      NOT NULL REFERENCES network_profiles(school_id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, school_id)
);

CREATE INDEX network_saves_school ON network_saves (school_id);

-- A user's application to a school. While it is started, nothing about the
-- user is shared. Submitting stores exactly what the user filled in on the
-- form (applicant, guardian, current school, academic record and the names of
-- the documents they attached), with when and to what they consented.
CREATE TABLE network_applications (
    id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    school_id    bigint      NOT NULL REFERENCES network_profiles(school_id) ON DELETE CASCADE,
    user_id      bigint      NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    status       text        NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'submitted')),
    shared       jsonb,
    consent_text text,
    consented_at timestamptz,
    started_at   timestamptz NOT NULL DEFAULT now(),
    submitted_at timestamptz,
    UNIQUE (school_id, user_id),
    CHECK (status = 'started' OR (shared IS NOT NULL AND consent_text IS NOT NULL AND consented_at IS NOT NULL AND submitted_at IS NOT NULL))
);

CREATE INDEX network_applications_user ON network_applications (user_id, started_at DESC);

-- A count about the people who looked at a school, or NULL when fewer than
-- min_cohort people are behind it, so no one can be singled out. Its own type
-- lets the Go code read it as a nullable number.
CREATE DOMAIN network_cohort_count AS bigint;

-- +goose StatementBegin
CREATE FUNCTION network_cohort_total(n bigint, min_cohort bigint) RETURNS network_cohort_count
LANGUAGE sql IMMUTABLE AS $$ SELECT CASE WHEN n >= min_cohort THEN n END $$;
-- +goose StatementEnd

-- +goose Down
DROP FUNCTION network_cohort_total(bigint, bigint);
DROP DOMAIN network_cohort_count;
DROP TABLE network_applications;
DROP TABLE network_saves;
DROP TABLE network_profile_views;
DROP TABLE network_vacancies;
DROP TABLE network_exam_centres;
DROP TABLE network_profiles;
