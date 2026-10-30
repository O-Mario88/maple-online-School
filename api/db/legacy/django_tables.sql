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
    id                       bigint       PRIMARY KEY,
    name                     varchar(100) NOT NULL,
    level_id                 bigint       NOT NULL,
    internal_canonical_grade integer      NOT NULL
);

CREATE TABLE institutions_institutionsubject (
    id             bigint PRIMARY KEY,
    institution_id bigint NOT NULL,
    subject_id     bigint NOT NULL,
    custom_name    varchar(255)
);

CREATE TABLE curriculum_subject (
    id   bigint       PRIMARY KEY,
    name varchar(255) NOT NULL,
    code varchar(50)
);

-- The rest of the curriculum: read only.
CREATE TABLE curriculum_country (
    id     bigint       PRIMARY KEY,
    code   varchar(10)  NOT NULL,
    name   varchar(100) NOT NULL,
    active boolean      NOT NULL
);

CREATE TABLE curriculum_educationlevel (
    id         bigint       PRIMARY KEY,
    name       varchar(100) NOT NULL,
    track_id   bigint       NOT NULL,
    is_primary boolean      NOT NULL
);

CREATE TABLE curriculum_topic (
    id             bigint       PRIMARY KEY,
    name           varchar(255) NOT NULL,
    "order"        integer      NOT NULL,
    class_level_id bigint       NOT NULL,
    subject_id     bigint       NOT NULL
);

CREATE TABLE curriculum_topiccompetency (
    id                    bigint PRIMARY KEY,
    description           text   NOT NULL,
    code                  varchar(50),
    curriculum_version_id bigint NOT NULL,
    topic_id              bigint NOT NULL
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

-- Resource library (Go owns writes to resources_resource and resources_sharedresourcelink).
CREATE TABLE resources_resource (
    id                   bigint PRIMARY KEY,
    owner_type           varchar(20) NOT NULL,
    title                varchar(255) NOT NULL,
    file_path            varchar(100),
    external_url         varchar(500),
    vimeo_upload_status  varchar(20) NOT NULL,
    vimeo_video_id       varchar(50),
    visibility           varchar(30) NOT NULL,
    created_at           timestamptz NOT NULL,
    class_level_id       bigint REFERENCES curriculum_classlevel(id),
    owner_institution_id bigint REFERENCES institutions_institution(id),
    subject_id           bigint REFERENCES curriculum_subject(id),
    topic_id             bigint REFERENCES curriculum_topic(id),
    uploaded_by_id       bigint NOT NULL REFERENCES accounts_user(id),
    description          text,
    author               varchar(255),
    category             varchar(100),
    price                numeric(8,2) NOT NULL,
    rating               numeric(3,2) NOT NULL,
    is_featured          boolean NOT NULL
);

CREATE TABLE resources_sharedresourcelink (
    id              bigint PRIMARY KEY,
    added_at        timestamptz NOT NULL,
    added_by_id     bigint NOT NULL REFERENCES accounts_user(id),
    resource_id     bigint NOT NULL REFERENCES resources_resource(id),
    target_class_id bigint NOT NULL REFERENCES classes_class(id),
    UNIQUE (resource_id, target_class_id)
);

-- Rows that point at a resource; Django cascaded or nulled them in the ORM.
CREATE TABLE resources_resourcelessonlink (
    id          bigint PRIMARY KEY,
    resource_id bigint NOT NULL REFERENCES resources_resource(id),
    lesson_id   bigint NOT NULL
);

CREATE TABLE resources_resourceengagementrecord (
    id          bigint PRIMARY KEY,
    resource_id bigint NOT NULL REFERENCES resources_resource(id)
);

CREATE TABLE intelligence_studytask (
    id                 bigint PRIMARY KEY,
    linked_resource_id bigint REFERENCES resources_resource(id)
);

-- Lessons (Go owns writes to lessons, notes, recordings and lesson attendance).
CREATE TABLE lessons_lesson (
    id              bigint PRIMARY KEY,
    title           varchar(255) NOT NULL,
    access_mode     varchar(20) NOT NULL,
    scheduled_at    timestamptz NOT NULL,
    published_at    timestamptz,
    created_at      timestamptz NOT NULL,
    parent_class_id bigint NOT NULL REFERENCES classes_class(id),
    topic_id        bigint REFERENCES curriculum_topic(id)
);

CREATE TABLE lessons_lessonnote (
    id             bigint PRIMARY KEY,
    content_blocks jsonb NOT NULL,
    created_at     timestamptz NOT NULL,
    updated_at     timestamptz NOT NULL,
    lesson_id      bigint NOT NULL REFERENCES lessons_lesson(id)
);

CREATE TABLE lessons_lessonrecording (
    id         bigint PRIMARY KEY,
    url        varchar(500) NOT NULL,
    duration   integer NOT NULL,
    created_at timestamptz NOT NULL,
    lesson_id  bigint NOT NULL REFERENCES lessons_lesson(id)
);

CREATE TABLE lessons_lessonattendance (
    id               bigint PRIMARY KEY,
    status           varchar(20) NOT NULL,
    duration_minutes integer NOT NULL,
    recorded_at      timestamptz NOT NULL,
    lesson_id        bigint NOT NULL REFERENCES lessons_lesson(id),
    student_id       bigint NOT NULL REFERENCES accounts_user(id)
);

-- Rows elsewhere that point at a lesson; only their lesson ids are read.
CREATE TABLE lessons_lessonqualificationrecord (id uuid PRIMARY KEY, lesson_id bigint NOT NULL);
CREATE TABLE lessons_lessoninstance (id bigint PRIMARY KEY, lesson_plan_id bigint);
CREATE TABLE attendance_lessonattendance (id bigint PRIMARY KEY, lesson_id bigint NOT NULL);
CREATE TABLE live_sessions_livesession (id bigint PRIMARY KEY, lesson_id bigint NOT NULL UNIQUE);
CREATE TABLE resources_contentitem (id bigint PRIMARY KEY, lesson_id bigint);
CREATE TABLE resources_contentassignment (id bigint PRIMARY KEY, lesson_id bigint);
