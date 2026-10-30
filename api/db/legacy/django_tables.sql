-- Tables created by Django's migrations that the Go service uses.
-- This file exists only so sqlc can type-check queries. It is never applied.
-- Only the columns Go touches are listed.
--
-- Write ownership: Go reads the account and school tables (Django still
-- writes them) and owns all writes to the assessment, submission and grade
-- tables. See api/README.md for the current split.

CREATE TABLE assessments_assessment (
    id              bigint       PRIMARY KEY,
    type            varchar(50)  NOT NULL,
    source          varchar(50)  NOT NULL,
    max_score       numeric(5,2) NOT NULL,
    created_at      timestamptz  NOT NULL,
    target_group_id bigint,
    term_id         bigint,
    topic_id        bigint,
    window_id       bigint,
    created_by_id   bigint,
    instructions    text         NOT NULL,
    is_published    boolean      NOT NULL,
    title           varchar(255) NOT NULL
);

CREATE TABLE assessments_question (
    id             bigint       PRIMARY KEY,
    type           varchar(50)  NOT NULL,
    content        text         NOT NULL,
    marks          numeric(5,2) NOT NULL,
    options        jsonb        NOT NULL,
    correct_answer text         NOT NULL,
    "order"        integer      NOT NULL,
    assessment_id  bigint       NOT NULL
);

CREATE TABLE assessments_submission (
    id            bigint       PRIMARY KEY,
    status        varchar(50)  NOT NULL,
    submitted_at  timestamptz,
    answers_data  jsonb        NOT NULL,
    total_score   numeric(5,2),
    assessment_id bigint       NOT NULL,
    student_id    bigint       NOT NULL
);

CREATE TABLE grading_graderecord (
    id               bigint       PRIMARY KEY,
    score            numeric(5,2) NOT NULL,
    teacher_feedback text,
    graded_at        timestamptz  NOT NULL,
    submission_id    bigint       NOT NULL UNIQUE
);

CREATE TABLE accounts_user (
    id                bigint       PRIMARY KEY,
    password          varchar(128) NOT NULL,
    email             varchar(254) NOT NULL,
    full_name         varchar(255) NOT NULL,
    country_code      varchar(10)  NOT NULL,
    role              varchar(20)  NOT NULL,
    is_active         boolean      NOT NULL,
    email_verified    boolean      NOT NULL
);

CREATE TABLE institutions_institution (
    id   bigint       PRIMARY KEY,
    name varchar(255) NOT NULL
);

CREATE TABLE institutions_institutionmembership (
    id             bigint      PRIMARY KEY,
    role           varchar(20) NOT NULL,
    status         varchar(20) NOT NULL,
    institution_id bigint      NOT NULL,
    user_id        bigint      NOT NULL
);

CREATE TABLE accounts_parentprofile (
    id      bigint PRIMARY KEY,
    user_id bigint NOT NULL
);

CREATE TABLE accounts_studentprofile (
    id      bigint PRIMARY KEY,
    user_id bigint NOT NULL
);

CREATE TABLE parent_portal_parentstudentlink (
    id                 bigint      PRIMARY KEY,
    relationship_type  varchar(20) NOT NULL,
    consent_status     varchar(50) NOT NULL,
    parent_profile_id  bigint      NOT NULL,
    student_profile_id bigint      NOT NULL
);
