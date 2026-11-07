#!/usr/bin/env node
/**
 * Runs the browser tests (e2e/) against a fresh export of the sample-data web build, served by
 * `expo serve`: faster and steadier than the dev server, which bundles every page on first visit and
 * can serve a stale page after many edits. Arguments are passed to Playwright, e.g.
 * `npm run test:nav -- e2e/page-quality.spec.ts`.
 */
import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT = Number(process.env.NAV_TEST_PORT ?? 8089);
const START_TIMEOUT_MS = 60_000;
const POLL_MS = 500;

const out = mkdtempSync(join(tmpdir(), 'maple-pages-'));
const env = { ...process.env, EXPO_PUBLIC_MOCK_DATA: 'true' };
delete env.EXPO_PUBLIC_DESIGN_DATA;
let server;
let status = 1;

async function waitForServer(url) {
  const deadline = Date.now() + START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
  throw new Error(`expo serve did not answer ${url} within ${START_TIMEOUT_MS / 1000}s`);
}

try {
  console.log('Exporting the sample-data web build…');
  execFileSync('npx', ['expo', 'export', '-p', 'web', '--output-dir', out], { env, stdio: 'ignore' });
  writeFileSync(join(out, 'package.json'), '{"name":"maple-pages","version":"1.0.0"}\n');
  server = spawn('npx', ['expo', 'serve', out, '--port', String(PORT)], { env, stdio: 'ignore' });
  await waitForServer(`http://localhost:${PORT}/welcome`);
  try {
    execFileSync('npx', ['playwright', 'test', ...process.argv.slice(2)], { env: { ...env, NAV_TEST_PORT: String(PORT) }, stdio: 'inherit' });
    status = 0;
  } catch {
    status = 1; // Playwright has printed the failures.
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
} finally {
  server?.kill();
  rmSync(out, { recursive: true, force: true });
  process.exit(status);
}
