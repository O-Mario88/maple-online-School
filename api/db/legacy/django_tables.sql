-- Tables owned by the Django backend that the Go service reads.
-- Django's migrations create and change these; Go never writes to them.
-- This file exists only so sqlc can type-check queries. It is never applied.
-- Only the columns Go reads are listed.

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
