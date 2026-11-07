/**
 * Exports the design build's sample data as one JSON file for the Go seeder (api/cmd/seed-design),
 * so a local Postgres database holds the same school, people and records the designs show.
 *
 * Run with `npm run db:design` (or `npm run design:export` on its own). It runs under Jest only
 * because Jest already loads the sample data with its @/ paths and images; it is not a test, and the
 * normal test run never picks it up (its name doesn't end in .test.ts).
 *
 * Two sources, kept as they are:
 * - `api`: what the design build's fake API (mock/shared.ts) answers for every page that already
 *   runs on the real API, read as the school admin, who sees every school record.
 * - `school`: the school-admin designs' own rows (roster, timetable, marks, fees, payments, arrears).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import * as schoolAdmin from '@/mock/school-admin';
import { demoAccounts, mockApiFetch, setActiveDemoAccount, type DemoAccountKey } from '@/mock/shared';

const OUT = process.env.DESIGN_DATA_OUT ?? path.resolve(__dirname, '../../../.local/design-data.json');

/** The fake API's read endpoints the live app calls, with every class and thread the samples name. */
const ENDPOINTS: readonly string[] = [
  '/api/v1/classes/',
  ...[1, 2, 3, 4].map((id) => `/api/v1/classes/${id}/roster/`),
  '/api/v1/scheduling/timetable/',
  '/api/v1/lessons/lesson/',
  '/api/v1/live-sessions/live-session/',
  '/api/v1/assessments/assessment/',
  '/api/v1/assessments/submission/',
  '/api/v1/grading/records/',
  '/api/v1/grading/reports/',
  '/api/v1/grading/subjects/',
  '/api/v1/finance/fee-items/',
  '/api/v1/finance/invoices/',
  '/api/v1/library/items/',
  '/api/v1/messages/threads/',
  ...[1, 2].map((id) => `/api/v1/messages/threads/${id}/`),
  '/api/v1/inbox/',
  '/api/v1/attendance/daily/',
];

async function get(url: string): Promise<unknown> {
  const res = await mockApiFetch(`http://localhost:8080${url}`);
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.json();
}

test('export the design data', async () => {
  const keys = Object.keys(demoAccounts) as DemoAccountKey[];
  const accounts: Record<string, unknown> = {};
  for (const key of keys) accounts[key] = { ...demoAccounts[key].me, portal: demoAccounts[key].portal, title: demoAccounts[key].role };

  setActiveDemoAccount('institution');
  const api: Record<string, unknown> = {};
  for (const url of ENDPOINTS) api[url] = await get(url);

  const school = {
    timetable: schoolAdmin.timetable,
    marks: schoolAdmin.reportCards.marks,
    subjects: schoolAdmin.reportCards.subjects,
    roster: schoolAdmin.roster.rows,
    fees: { structures: schoolAdmin.fees.structures, payments: schoolAdmin.fees.payments, arrears: schoolAdmin.fees.arrears },
  };

  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify({ exportedAt: new Date().toISOString(), accounts, api, school }, null, 2)}\n`);
  expect(Object.keys(api)).toHaveLength(ENDPOINTS.length);
});
