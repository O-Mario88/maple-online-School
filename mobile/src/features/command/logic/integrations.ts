/**
 * Rules behind Maple Command › Finance › Financial Integrations. Imports are idempotent (a
 * provider's reference is posted once, however often it arrives), failures back off and then
 * become exceptions, credentials are masked and rotated, and every action is logged.
 * Option C, hybrid accounting: schools upload bank statements by hand; only Maple's corporate
 * books take live bank and gateway feeds.
 */

export interface IncomingTxn {
  provider: string;
  ref: string;
  amount: number;
}

const keyOf = (t: IncomingTxn) => `${t.provider}:${t.ref}`;

/** Accepts each provider reference once; returns a new `seen` set and leaves the old one alone. */
export function ingest(batch: readonly IncomingTxn[], seen: ReadonlySet<string>): { accepted: readonly IncomingTxn[]; duplicates: number; seen: ReadonlySet<string> } {
  const next = new Set(seen);
  const accepted: IncomingTxn[] = [];
  for (const t of batch) {
    if (next.has(keyOf(t))) continue;
    next.add(keyOf(t));
    accepted.push(t);
  }
  return { accepted, duplicates: batch.length - accepted.length, seen: next };
}

export const MAX_ATTEMPTS = 5;
const MAX_WAIT_MINUTES = 60;

/** After failed attempt `attempt`, wait 1, 2, 4, 8… minutes; after the last one, raise an exception. */
export function nextRetry(attempt: number): { status: 'Retrying' | 'Exception'; waitMinutes: number } {
  if (attempt >= MAX_ATTEMPTS) return { status: 'Exception', waitMinutes: 0 };
  return { status: 'Retrying', waitMinutes: Math.min(MAX_WAIT_MINUTES, 2 ** (attempt - 1)) };
}

const VISIBLE = 4;
export function maskSecret(secret: string): string {
  if (secret.length <= VISIBLE * 2) return '••••';
  const prefix = secret.match(/^[a-z]+_[a-z]+_/i)?.[0] ?? '';
  return `${prefix}••••••••${secret.slice(-VISIBLE)}`;
}

const ROTATE_DAYS = 90;
const DAY_MS = 86_400_000;
export const rotationDue = (lastRotated: string, today: string): boolean => (Date.parse(today) - Date.parse(lastRotated)) / DAY_MS > ROTATE_DAYS;

export type ExceptionStatus = 'Open' | 'In Progress' | 'Retrying' | 'Resolved';

export function resolveException<T extends { id: string; status: ExceptionStatus; log: readonly string[] }>(ex: T, action: 'review' | 'resolve' | 'retry', note: string, by: string, at: string): { exception?: T; error?: string } {
  if (ex.status === 'Resolved') return { error: `${ex.id} is already resolved.` };
  if (action === 'resolve' && !note.trim()) return { error: 'Add a note saying how it was resolved; it goes on the audit log.' };
  const status: ExceptionStatus = action === 'resolve' ? 'Resolved' : action === 'retry' ? 'Retrying' : 'In Progress';
  const entry = `${at} ${by} ${action === 'resolve' ? `resolved: ${note.trim()}` : action === 'retry' ? 'queued a retry' : 'started review'}`;
  return { exception: { ...ex, status, log: [...ex.log, entry] } };
}

/** Option C: live feeds are for Maple corporate only; schools upload statements. */
export const canUseFeed = (entity: 'corporate' | 'school'): boolean => entity === 'corporate';

export function webhookHealth(endpoints: readonly { healthy: boolean; ms: number; success: number }[]) {
  const n = endpoints.length || 1;
  return {
    healthy: endpoints.filter((e) => e.healthy).length,
    total: endpoints.length,
    avgMs: Math.round(endpoints.reduce((s, e) => s + e.ms, 0) / n),
    successRate: Math.round((endpoints.reduce((s, e) => s + e.success, 0) / n) * 10_000) / 100,
  };
}
