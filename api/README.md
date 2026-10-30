# Maple Go API

The Go backend for Maple. It is replacing the Django backend (`edify_backend/`)
one module at a time. While that happens, the Go service sits in front of
Django: paths it handles are answered in Go, and every other `/api/` path is
forwarded to Django unchanged. Apps only ever talk to this service.

| Module   | Status in Go | Paths |
| -------- | ------------ | ----- |
| Identity | Done         | `/api/v1/auth/token/`, `token/refresh/`, `logout/`, `me/` |
| Learning: assignments, submissions, grades | Done | `/api/v1/assessments/assessment/`, `/api/v1/assessments/submission/`, `/api/v1/grading/records/` |
| School: classes, enrolment, daily register | Done | `/api/v1/classes/` (+ `{id}/roster/`), `/api/v1/class-enrollments/`, `/api/v1/attendance/daily/` |
| Reports: subject marks, report cards | Done | `/api/v1/grading/subjects/`, `/api/v1/grading/reports/` (+ `generate/`, `{id}/`) |
| Timetable: terms, rooms, lessons | Done | `/api/v1/scheduling/terms/`, `/api/v1/scheduling/rooms/`, `/api/v1/scheduling/timetable/` |
| Institutions: schools, memberships, invitations | Done | `/api/v1/institutions/` (+ `{id}/`, `{id}/bulk_invite/`), `/api/v1/institution-memberships/` (+ `{id}/`, `{id}/accept/`) |
| Curriculum: countries, levels, subjects, topics, catalog | Done (read-only) | `/api/v1/curriculum/full-tree/` (public), `countries/`, `class-levels/`, `subjects/` (+ `{id}/`), `topics/` (+ `{id}/`), `topic-competencies/` |
| Lessons: plans, notes, recordings, lesson attendance | Done | `/api/v1/lessons/lesson/` (+ `{id}/`), `lesson-note/`, `lesson-recording/`, `lesson-attendance/` |
| Live sessions: sessions, reminders, missed-session recovery | Done (recording sync still a Django task) | `/api/v1/live-sessions/live-session/` (+ `{id}/`), `session-reminder/`, `missed-recovery/` |
| Sign-up: register, activate, forgot/reset password, student onboarding | Done | `/api/v1/auth/register/`, `activate/`, `resend-activation/`, `forgot-password/`, `reset-password/`, `onboard-student/` |
| Library (playbook §5): items, review, class reading lists, progress | Done (file uploads come with object storage) | `/api/v1/library/items/` (+ `{id}/`, `moderate/`, `share/`), `classes/{id}/reading-list/`, `assigned/`, `progress/`, `continue/` |
| Health   | Done         | `/api/health/` |
| Everything else | Served by Django through the forwarder | all other `/api/v1/...` |

Paths Go owns never fall through to Django: a method Go doesn't support on them
returns 405 instead of being forwarded.

## How the two backends share data

- Both use the same Postgres database. Django's migrations still create the tables.
- Go **reads** the account and school tables (Django still writes those) and
  **owns all writes** to `assessments_assessment`, `assessments_submission`,
  `grading_graderecord`, `classes_class`, `classes_classenrollment`,
  `attendance_dailyregister`, `grading_subjectgrade`, `grading_reportcard`, `scheduling_academicterm`, `scheduling_room`, `scheduling_timetableslot` and its own `identity_revoked_tokens`. Django's endpoints
  for those tables have been removed. Question writes (`assessments_question`)
  are still Django's until quizzes move.
- Everything is scoped to the schools where the person has an **active**
  membership: staff see their schools' work, students their own, parents only
  children whose guardian link is approved.
- Go's own migrations live in `db/migrations` and are tracked in
  `go_schema_migrations`, separate from Django's history.
- Passwords use Django's `pbkdf2_sha256` format, so existing accounts sign in
  unchanged.
- Tokens copy SimpleJWT's claims and are signed with Django's `SECRET_KEY`, so a
  token from Go also works on the Django endpoints behind the forwarder.

When a module moves to Go, Go takes over writes to its tables, and the Django
code for it is deleted in the same change.

## Layout

```
cmd/maple-api/          entry point
internal/config/        environment settings
internal/server/        router, middleware, health, forwarder fallback
internal/identity/      sign-in, tokens, current user
internal/legacy/        forwarder to Django
internal/httpx/         JSON helpers, rate limiting
internal/platform/      Postgres pool + migrations, sqlc-generated queries
db/migrations/          SQL migrations for Go-owned tables
db/queries/             SQL queries (sqlc generates Go from these)
db/legacy/              Django tables Go reads, for sqlc type checking only
../openapi/maple.yaml   the API contract
```

## Running locally

Needs Go 1.27+ and Postgres 16.

```bash
# 1. Point Django at Postgres and seed demo accounts (once)
createdb maple_dev
cd edify_backend
DATABASE_URL=postgres://localhost/maple_dev venv/bin/python manage.py migrate
DATABASE_URL=postgres://localhost/maple_dev venv/bin/python manage.py seed_pilot
DATABASE_URL=postgres://localhost/maple_dev venv/bin/python manage.py runserver 8000

# 2. Configure and run the Go API (port 8080)
cp api/.env.example .local/api.env   # then set JWT_SIGNING_KEY to Django's SECRET_KEY
cd api && bash -c 'set -a; . ../.local/api.env; set +a; go run ./cmd/maple-api'
```

## Tests

```bash
cd api
go test -race ./...
# Also run the database tests against the seeded Postgres:
MAPLE_TEST_DATABASE_URL=postgres://localhost/maple_dev go test -race ./...
```

After changing anything in `db/queries` or `db/migrations`, regenerate the
query code with `go tool sqlc generate`.

## Email

Sign-up and password emails go through SMTP when `SMTP_HOST` is set
(`SMTP_PORT` defaults to 587, plus `SMTP_USERNAME`, `SMTP_PASSWORD` and
`MAIL_FROM`). Without it, emails are written to the log so links can be
tested locally. Links open the app at `APP_URL` (default
`http://localhost:8081`).
