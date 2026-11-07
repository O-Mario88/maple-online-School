#!/usr/bin/env node
/**
 * Keeps the web app's first load in budget.
 *
 * Exports a deployment build (no mock data), serves it with `expo serve`, and adds up the
 * gzipped JavaScript each key page's HTML loads. Exits 1 if any page is over budget.
 *
 * About 300 KB of every page is the framework itself (Expo Router, React Native Web and
 * React DOM), so the budget leaves roughly 175 KB for Maple's own shared code and the page.
 * Granular chunking (app.json experiments.chunking) is what keeps pages near 430 KB; without
 * it every page loaded one ~680 KB common chunk.
 */
import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET_KB = 475;
const PAGES = ['/sign-in', '/welcome', '/schools/pricing'];
const PORT = Number(process.env.BUNDLE_CHECK_PORT ?? 8093);
const SERVER_START_TIMEOUT_MS = 60_000;
const POLL_MS = 500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** The scripts a page's HTML loads, as paths under client/. */
function scriptPaths(html) {
  const found = html.matchAll(/(?:src|href)="(\/_expo\/static\/js\/[^"]+\.js)"/g);
  return [...new Set([...found].map((m) => m[1]))];
}

async function waitForServer(url) {
  const deadline = Date.now() + SERVER_START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // Not listening yet.
    }
    await sleep(POLL_MS);
  }
  throw new Error(`expo serve did not answer ${url} within ${SERVER_START_TIMEOUT_MS / 1000}s`);
}

async function weigh(out, page) {
  const res = await fetch(`http://localhost:${PORT}${page}`);
  if (!res.ok) throw new Error(`${page} answered ${res.status}`);
  const scripts = scriptPaths(await res.text());
  const bytes = scripts.reduce((sum, path) => sum + gzipSync(readFileSync(join(out, 'client', path))).length, 0);
  return { page, scripts: scripts.length, kb: Math.round(bytes / 1024) };
}

const out = mkdtempSync(join(tmpdir(), 'maple-bundle-'));
const env = { ...process.env };
delete env.EXPO_PUBLIC_MOCK_DATA;
delete env.EXPO_PUBLIC_DESIGN_DATA;
let server;

try {
  execFileSync('npx', ['expo', 'export', '-p', 'web', '--output-dir', out, '--clear'], { env, stdio: 'ignore' });
  // expo serve wants a project file in the folder it serves.
  writeFileSync(join(out, 'package.json'), '{"name":"maple-bundle-check","version":"1.0.0"}\n');
  server = spawn('npx', ['expo', 'serve', out, '--port', String(PORT)], { env, stdio: 'ignore' });
  await waitForServer(`http://localhost:${PORT}${PAGES[0]}`);

  const results = [];
  for (const page of PAGES) results.push(await weigh(out, page));
  for (const r of results) console.log(`${r.page}: ${r.kb} KB gzipped in ${r.scripts} scripts`);
  const over = results.filter((r) => r.kb > BUDGET_KB);
  if (over.length > 0) {
    console.error(`Over the ${BUDGET_KB} KB first-load budget: ${over.map((r) => r.page).join(', ')}`);
    process.exitCode = 1;
  } else {
    console.log(`Every page is within the ${BUDGET_KB} KB first-load budget.`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  server?.kill();
  rmSync(out, { recursive: true, force: true });
}
