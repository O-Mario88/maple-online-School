# Maple Global Online School

One school platform for learners, teachers, families and school leaders, built as:

- [`api/`](api/README.md): the **Go** API, a modular monolith (chi, pgx, sqlc, goose) on PostgreSQL. It creates and migrates its own schema on start.
- [`mobile/`](mobile/README.md): the **React Native** app for Android, iOS and the web (Expo Router, TanStack Query), typed from the API contract.
- [`openapi/maple.yaml`](openapi/maple.yaml): the API contract both share.
- [`docs/`](docs/): the concept, pilot notes and history.

## Run it

You need Go (see `api/go.mod`), Node 22 and PostgreSQL 16.

```bash
createdb maple_dev
```

Start the API (it builds the database on first start, including Uganda's NCDC curriculum):

```bash
cd api && DATABASE_URL=postgres://localhost/maple_dev JWT_SIGNING_KEY=dev-only-signing-key-of-32-plus-characters FINANCE_SANDBOX=true FINANCE_WEBHOOK_SECRET=dev-only-webhook-secret-of-32-plus-chars CORS_ORIGINS=http://localhost:8081 go run ./cmd/maple-api
```

Start the app on the web (or press `i` / `a` in the Expo terminal for iOS / Android):

```bash
cd mobile && npm install && npx expo start --web --port 8081
```

The app talks to `http://localhost:8080`; set `EXPO_PUBLIC_API_URL` to point it elsewhere.

Or run Postgres and the API together with Docker:

```bash
cp .env.example .env
```

```bash
docker compose up --build
```

## Check it

```bash
cd api && gofmt -l . && go vet ./... && MAPLE_TEST_DATABASE_URL=postgres://localhost/maple_dev go test -race ./...
```

```bash
cd mobile && npm run typecheck && npx expo lint && npm test
```

The API's database tests are skipped unless `MAPLE_TEST_DATABASE_URL` is set. After changing `openapi/maple.yaml`, run `npm run api:types` in `mobile/`; after changing SQL in `api/db/queries/`, run `go tool sqlc generate` in `api/`.

## History

Maple began as a Django API with a Vite web app. Everything now runs on Go and React Native; the Django-era tables live on in [`api/db/baseline/legacy_schema.sql`](api/db/baseline/legacy_schema.sql), and accounts and passwords created then keep working.
