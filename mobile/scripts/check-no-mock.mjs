#!/usr/bin/env node
/**
 * Proves a deployment build carries no mock data.
 *
 * Exports the web app with EXPO_PUBLIC_MOCK_DATA unset, then searches every
 * output file for the sentinel string that src/mock/index.ts exports. Exits 1
 * if any file contains it.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SENTINEL = 'maple-mock-fixtures-v1';

function filesUnder(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

const out = mkdtempSync(join(tmpdir(), 'maple-export-'));
const env = { ...process.env };
delete env.EXPO_PUBLIC_MOCK_DATA;

try {
  execFileSync('npx', ['expo', 'export', '-p', 'web', '--output-dir', out, '--clear'], { env, stdio: 'ignore' });
  const leaks = filesUnder(out).filter((file) => readFileSync(file, 'utf8').includes(SENTINEL));
  if (leaks.length > 0) {
    console.error(`Mock data found in a deployment build:\n${leaks.map((f) => `  ${f.slice(out.length + 1)}`).join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log('No mock data in the deployment build.');
  }
} finally {
  rmSync(out, { recursive: true, force: true });
}
