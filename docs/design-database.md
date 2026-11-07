# The local design database

A Postgres database on your machine holding the designs' sample data: the same schools, people,
classes, timetable, register, marks, report cards, fees, payments, library, messages and notices
the design build shows. The live app (real sign-in, real Go API) runs against it, so you can see
the designed pages working on real data end to end.

It never reaches a deployment:

- The seeder (`api/cmd/seed-design`) refuses `APP_ENV=production`, any database that isn't on this
  machine, and any database whose name doesn't end in `_design` (it drops and rebuilds that database
  on every run). Its tests cover each refusal.
- The deployed API image builds only `./cmd/maple-api`.
- Deployed app builds carry no sample data (`npm run check:no-mock` proves it in CI).

## Build it

Needs Postgres running locally and `.local/api.env` (the API's usual settings).

```bash
cd mobile && npm run db:design
```

This exports the sample data to `.local/design-data.json`, rebuilds `maple_design`, and writes
`.local/design-api.env` (your API settings, pointed at `maple_design` on port 8088). Run it again any
time the designs' sample data changes: it always starts from an empty database.

## Run the app on it

```bash
cd api && set -a && . ../.local/design-api.env && set +a && go run ./cmd/maple-api
```

```bash
cd mobile && npm run web:design-db
```

Open <http://localhost:8086> and sign in. The five demo accounts keep their demo addresses
(`student@maple.school`, `teacher@`, `parent@`, `institution@`, `admin@`); everyone else the designs
name has an address at `design.maple.test`, which can't receive mail. All share one password, written
with the addresses to `.local/design-accounts.env` (git-ignored). Set `DESIGN_PASSWORD` before
`npm run db:design` to choose it yourself. In the desktop app, the launch configurations
`api-design` and `app-design-db` start the two servers.

## What is filled in

The sample data is written for screens, so a few things are filled in to make it rows:

- Daniel Okello (the learner account) and "Daniel O." (Grace Namukasa's child) are one person.
- Primary 1A, 1B and 1C have no class teacher in the designs; each gets one from its timetable.
- A learner the designs list in two classes is put in the first one named.
- Primary 1A gets one school week of register (everyone present, one late, one absent).
- Lessons and live classes move with today: the earliest is tomorrow, the rest keep their spacing.
- Classes are billed as a whole, as the API does; each learner's payment is recorded as the design
  lists it, so their balances are the designs' arrears.
