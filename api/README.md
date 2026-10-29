# Maple Go API

The Go backend for Maple. It is replacing the Django backend (`edify_backend/`)
one module at a time. While that happens, the Go service sits in front of
Django: paths it handles are answered in Go, and every other `/api/` path is
forwarded to Django unchanged. Apps only ever talk to this service.

| Module   | Status in Go | Paths |
| -------- | ------------ | ----- |
| Identity | Done         | `/api/v1/auth/token/`, `token/refresh/`, `logout/`, `me/` |
| Health   | Done         | `/api/health/` |
| Everything else | Served by Django through the forwarder | all other `/api/v1/...` |

## How the two backends share data

- Both use the same Postgres database.
- Go **reads** Django's tables (for now, `accounts_user`, memberships and
  parent links) and **writes only tables it owns** (`identity_revoked_tokens`).
  Go's migrations live in `db/migrations` and are tracked in
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
