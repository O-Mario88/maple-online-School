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
    email_verified    boolean      NOT NULL,
    is_superuser      boolean      NOT NULL,
    whatsapp_opt_in   boolean      NOT NULL,
    is_staff          boolean      NOT NULL,
    date_joined       timestamptz  NOT NULL
);

CREATE TABLE institutions_institution (
    id                bigint       PRIMARY KEY,
    name              varchar(255) NOT NULL,
    slug              varchar(255) UNIQUE,
    primary_color     varchar(7)   NOT NULL,
    secondary_color   varchar(7)   NOT NULL,
    country_code      varchar(10)  NOT NULL,
    curriculum_track  varchar(50)  NOT NULL,
    subscription_plan varchar(50)  NOT NULL,
    is_active         boolean      NOT NULL,
    created_at        timestamptz  NOT NULL,
    grade_offerings   jsonb        NOT NULL,
    school_level      varchar(50)  NOT NULL,
    in_grace_period   boolean      NOT NULL
);

CREATE TABLE institutions_institutionmembership (
    id             bigint      PRIMARY KEY,
    role           varchar(20) NOT NULL,
    status         varchar(20) NOT NULL,
    joined_at      timestamptz NOT NULL,
    institution_id bigint      NOT NULL,
    user_id        bigint      NOT NULL,
    UNIQUE (user_id, institution_id, role)
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

-- Classes, enrolment and the daily register: Go owns writes.
CREATE TABLE classes_class (
    id                     bigint       PRIMARY KEY,
    title                  varchar(255) NOT NULL,
    visibility             varchar(20)  NOT NULL,
    is_published           boolean      NOT NULL,
    created_at             timestamptz  NOT NULL,
    class_level_id         bigint       NOT NULL,
    institution_id         bigint       NOT NULL,
    institution_subject_id bigint,
    teacher_id             bigint       NOT NULL
);

CREATE TABLE classes_classenrollment (
    id                bigint      PRIMARY KEY,
    status            varchar(20) NOT NULL,
    enrolled_at       timestamptz NOT NULL,
    enrolled_class_id bigint      NOT NULL,
    student_id        bigint      NOT NULL,
    UNIQUE (enrolled_class_id, student_id)
);

CREATE TABLE attendance_dailyregister (
    id             bigint      PRIMARY KEY,
    record_date    date        NOT NULL,
    status         varchar(30) NOT NULL,
    notes          text,
    created_at     timestamptz NOT NULL,
    institution_id bigint      NOT NULL,
    recorded_by_id bigint,
    student_id     bigint      NOT NULL,
    term_id        bigint      NOT NULL,
    UNIQUE (student_id, record_date)
);

-- Read only (Django still writes these).
CREATE TABLE scheduling_academicterm (
    id             bigint       PRIMARY KEY,
    start_date     date         NOT NULL,
    end_date       date         NOT NULL,
    is_active      boolean      NOT NULL,
    institution_id bigint       NOT NULL,
    name           varchar(100) NOT NULL
);

CREATE TABLE curriculum_classlevel (
    id   bigint       PRIMARY KEY,
    name varchar(100) NOT NULL
);

CREATE TABLE institutions_institutionsubject (
    id             bigint PRIMARY KEY,
    institution_id bigint NOT NULL,
    subject_id     bigint NOT NULL,
    custom_name    varchar(255)
);

CREATE TABLE curriculum_subject (
    id   bigint       PRIMARY KEY,
    name varchar(255) NOT NULL
);

-- Subject marks and report cards: Go owns writes.
CREATE TABLE grading_subjectgrade (
    id                bigint       PRIMARY KEY,
    formative_score   numeric(5,2) NOT NULL,
    summative_score   numeric(5,2) NOT NULL,
    total_score       numeric(5,2),
    grade_letter      varchar(5),
    descriptor        text,
    teacher_remarks   text,
    finalized_at      timestamptz  NOT NULL,
    assigned_class_id bigint       NOT NULL,
    finalized_by_id   bigint,
    student_id        bigint       NOT NULL,
    term_id           bigint       NOT NULL,
    UNIQUE (student_id, assigned_class_id, term_id)
);

CREATE TABLE grading_reportcard (
    id                    bigint       PRIMARY KEY,
    overall_score         numeric(5,2),
    overall_grade_letter  varchar(5),
    promotion_status      varchar(50),
    class_teacher_remarks text,
    headteacher_remarks   text,
    pdf_file              varchar(100),
    is_published          boolean      NOT NULL,
    published_at          timestamptz,
    generated_at          timestamptz  NOT NULL,
    institution_id        bigint       NOT NULL,
    student_id            bigint       NOT NULL,
    template_id           bigint,
    term_id               bigint       NOT NULL,
    UNIQUE (student_id, term_id)
);

-- Rooms and timetable slots: Go owns writes (and to scheduling_academicterm above).
CREATE TABLE scheduling_room (
    id             bigint       PRIMARY KEY,
    name           varchar(100) NOT NULL,
    capacity       integer      NOT NULL,
    is_active      boolean      NOT NULL,
    institution_id bigint       NOT NULL,
    UNIQUE (institution_id, name)
);

CREATE TABLE scheduling_timetableslot (
    id                bigint  PRIMARY KEY,
    day_of_week       integer NOT NULL,
    start_time        time    NOT NULL,
    end_time          time    NOT NULL,
    is_active         boolean NOT NULL,
    assigned_class_id bigint  NOT NULL,
    institution_id    bigint  NOT NULL,
    room_id           bigint,
    teacher_id        bigint,
    term_id           bigint  NOT NULL,
    is_draft          boolean NOT NULL,
    subject_id        bigint
);
