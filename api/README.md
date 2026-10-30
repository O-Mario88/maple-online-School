# Maple API

The Go backend for Maple Global Online School: one modular monolith on
PostgreSQL. It serves every `/api/v1/...` path the app uses, creates the schema
on an empty database (`db/baseline/legacy_schema.sql`, the tables Maple first
made with Django) and applies its own migrations (`db/migrations`) on start.

## Modules

| Module | What it does | Paths |
|---|---|---|
| identity | Sign-in, tokens, the current user | `/api/v1/auth/token/`, `token/refresh/`, `logout/`, `me/` |
| signup | Registration, email activation, password reset, onboarding learners | `/api/v1/auth/register/`, `activate/`, `resend-activation/`, `forgot-password/`, `reset-password/`, `onboard-student/` |
| institutions | Set up a school, invite staff | `/api/v1/institutions/` |
| school | Classes, rosters, the daily register | `/api/v1/classes/`, `/api/v1/attendance/daily/` |
| timetable | The week's timetable | `/api/v1/scheduling/timetable/` |
| curriculum | Uganda's NCDC curriculum (seeded by default), the catalog tree | `/api/v1/curriculum/...` |
| learning | Assignments, submissions, marking | `/api/v1/assessments/...`, `/api/v1/grading/records/` |
| reports | Term marks and report cards | `/api/v1/grading/subjects/`, `/api/v1/grading/reports/` |
| lessons | Lesson plans, notes, recordings, lesson attendance | `/api/v1/lessons/...` |
| livesessions | Live classes without double-booking, reminders, catch-up | `/api/v1/live-sessions/...` |
| library | Notes, guides and links; reading lists; progress | `/api/v1/library/...` |
| finance | Fees on a double-entry ledger; mobile money; receipts; export | `/api/v1/finance/...` |
| family | Schools confirm which parents can see each learner | `/api/v1/family/links/` |
| inbox | In-app notifications | `/api/v1/inbox/` |
| insights | Learners who need their teacher; interventions | `/api/v1/insights/...` |
| messages | Teacher and family conversations about a learner | `/api/v1/messages/...` |

Unknown paths get a JSON 404 and unsupported methods a JSON 405. Passwords use
the `pbkdf2_sha256` format Django used and tokens keep SimpleJWT's claims, so
accounts and sessions from before the move keep working.

## Layout

```
cmd/maple-api/          entry point
internal/config/        environment settings
internal/server/        router, middleware, health, JSON errors
internal/<module>/      one package per module (see above)
internal/roles/         which school roles may do what
internal/httpx/         JSON helpers, paging, rate limiting
internal/platform/      Postgres pool, schema and migrations, sqlc-generated queries
internal/testkit/       throwaway schools and people for database tests
db/baseline/            the schema an empty database starts from
db/migrations/          goose migrations
db/queries/             SQL queries (sqlc generates Go from these)
../openapi/maple.yaml   the API contract
```

## Running locally

Needs Go 1.27+ and Postgres 16.

```bash
createdb maple_dev
cp api/.env.example .local/api.env   # then set JWT_SIGNING_KEY and DATABASE_URL
cd api && bash -c 'set -a; . ../.local/api.env; set +a; go run ./cmd/maple-api'
```

## Tests

```bash
cd api
go test -race ./...
# Also run the database tests (they create and remove their own data):
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

## Payments

Fee payments post to an immutable double-entry ledger (migration 00003).
Mobile money and card collections need a provider; `FINANCE_SANDBOX=true`
turns on a fake one for development (refused when `APP_ENV=production`).
Providers confirm payments by calling `/api/v1/finance/webhooks/{provider}/`
with `X-Maple-Signature: sha256=<HMAC-SHA256 of the body>` using
`FINANCE_WEBHOOK_SECRET` (32+ characters). Every money-moving request needs
an `Idempotency-Key` header.
