#!/usr/bin/env node
/**
 * `npm run db:design`: builds the local design database, so the live app (real sign-in, real API)
 * shows the designs' school, people and records on this machine.
 *
 * 1. Exports the design build's sample data to .local/design-data.json (scripts/design-data/export.design.ts).
 * 2. Drops, rebuilds and seeds the local `maple_design` Postgres database (api/cmd/seed-design). The seeder
 *    refuses APP_ENV=production, any database that isn't on this machine, and any name not ending in _design.
 * 3. Writes .local/design-api.env: the API's usual .local/api.env, pointed at maple_design on port 8088.
 *
 * Then run the API with that file and the app with `npm run web:design-db` (or the launch configurations
 * "api-design" and "app-design-db"). Sign-ins are in .local/design-accounts.env. Nothing here runs in a
 * deployment, and deployment builds carry no sample data (npm run check:no-mock).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MOBILE = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = join(MOBILE, '..');
const LOCAL = join(ROOT, '.local');
const DESIGN_DB = process.env.DESIGN_DATABASE_URL ?? 'postgres://localhost/maple_design';
const DESIGN_API_PORT = 8088;
/** The app servers that talk to the design API: web:design-db (8086) and served exports (8098). */
const DESIGN_ORIGINS = ['http://localhost:8086', 'http://localhost:8098'];

if (process.env.APP_ENV === 'production') {
  console.error('APP_ENV is production: the design database is for this machine only.');
  process.exit(1);
}

const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: 'inherit', env: process.env });

console.log('1/3 Exporting the design data…');
run('npx', ['jest', '--config', 'scripts/design-data/jest.config.js', '--silent'], MOBILE);

console.log('2/3 Seeding maple_design…');
run('go', ['run', './cmd/seed-design', '-db', DESIGN_DB], join(ROOT, 'api'));

console.log('3/3 Writing .local/design-api.env…');
const base = join(LOCAL, 'api.env');
if (!existsSync(base)) {
  console.error('No .local/api.env to copy the API settings from (JWT_SIGNING_KEY and the rest). Create it first.');
  process.exit(1);
}
const overrides = { DATABASE_URL: DESIGN_DB, MAPLE_ADDR: `:${DESIGN_API_PORT}`, CORS_ORIGINS: DESIGN_ORIGINS.join(',') };
const lines = readFileSync(base, 'utf8')
  .split('\n')
  .filter((l) => !Object.keys(overrides).some((k) => l.startsWith(`${k}=`)));
const out = join(LOCAL, 'design-api.env');
writeFileSync(out, `${lines.join('\n').trimEnd()}\n${Object.entries(overrides).map(([k, v]) => `${k}=${v}`).join('\n')}\n`);
chmodSync(out, 0o600);

console.log(`
Done. Run the design API and the app:
  cd api && set -a && . ../.local/design-api.env && set +a && go run ./cmd/maple-api
  cd mobile && npm run web:design-db      # http://localhost:8086
Sign-ins: .local/design-accounts.env`);
