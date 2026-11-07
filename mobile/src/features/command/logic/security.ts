/**
 * Rules behind Maple Command › Security: a tamper-evident audit chain, masking and restricted
 * exports, privacy (data subject) requests, support SLAs, RLS tenant audits and cross-tenant alerts.
 */

/* ─── Audit chain ─── */

export interface AuditCore {
  id: string;
  at: string;
  user: string;
  action: string;
}

export type Chained<T> = T & { hash: string; prevHash: string };

/** A short, stable fingerprint (FNV-1a, 32-bit) — enough to show tampering in a design build; the server signs with SHA-256. */
function fingerprint(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

const GENESIS = '00000000';

function hashOf(e: AuditCore, prev: string): string {
  return fingerprint(`${prev}|${e.id}|${e.at}|${e.user}|${e.action}`);
}

/** Link records oldest first: each one stores the previous record's hash. */
export function buildChain<T extends AuditCore>(events: readonly T[]): readonly Chained<T>[] {
  const out: Chained<T>[] = [];
  let prev = GENESIS;
  for (const e of events) {
    const hash = hashOf(e, prev);
    out.push({ ...e, prevHash: prev, hash });
    prev = hash;
  }
  return out;
}

/** Recompute every hash; the first record that no longer matches is where the chain was edited. */
export function verifyChain<T extends AuditCore>(chain: readonly Chained<T>[]): { ok: true } | { ok: false; brokenAt: string } {
  let prev = GENESIS;
  for (const e of chain) {
    if (e.prevHash !== prev || hashOf(e, prev) !== e.hash) return { ok: false, brokenAt: e.id };
    prev = e.hash;
  }
  return { ok: true };
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  return `${name.slice(0, 2)}•••@${domain}`;
}

export function maskIp(ip: string): string {
  const parts = ip.split('.');
  return parts.length === 4 ? `${parts[0]}.${parts[1]}.•.•` : ip;
}

const EXPORT_ROLES = ['Global Admin', 'Global Administrator', 'Security Admin'];
const MIN_EXPORT_REASON = 10;

/** Audit exports are restricted: the right role and a written reason, which is itself logged. */
export function canExport(role: string, reason: string): { ok: boolean; why?: string } {
  if (!EXPORT_ROLES.includes(role)) return { ok: false, why: 'Only Security and Global Admins can export audit logs.' };
  if (reason.trim().length < MIN_EXPORT_REASON) return { ok: false, why: `Say why you need the export (at least ${MIN_EXPORT_REASON} characters).` };
  return { ok: true };
}

/* ─── Data (privacy) requests ─── */

export type RequestType = 'Export' | 'Deletion' | 'Access' | 'Correction';
export type RequestStatus = 'Pending' | 'Processing' | 'Under Review' | 'Completed' | 'Rejected';

export interface DataRequest {
  id: string;
  type: RequestType;
  status: RequestStatus;
  minor: boolean;
  identityVerified: boolean;
  guardianVerified: boolean;
  scope: readonly string[];
  linkExpires?: string;
  retained?: readonly string[];
  note?: string;
}

const DAY_MS = 86_400_000;

/** Days to the legal deadline (negative when overdue). */
export function dueState(due: string, today: string): { days: number; overdue: boolean; label: string } {
  const days = Math.round((Date.parse(due) - Date.parse(today)) / DAY_MS);
  if (days < 0) return { days, overdue: true, label: `${-days} day${days === -1 ? '' : 's'} overdue` };
  return { days, overdue: false, label: days === 0 ? 'Due today' : `${days} day${days === 1 ? '' : 's'} remaining` };
}

/** Before any data leaves Maple: the requester's identity, and for a learner under 18 a verified guardian. */
export function canRelease(r: Pick<DataRequest, 'minor' | 'identityVerified' | 'guardianVerified'>): { ok: boolean; reason?: string } {
  if (!r.identityVerified) return { ok: false, reason: 'Verify the requester’s identity first.' };
  if (r.minor && !r.guardianVerified) return { ok: false, reason: 'This involves a minor: verify the parent or guardian and their link to the learner first.' };
  return { ok: true };
}

/** Records the law says to keep even when an account is deleted, and for how long. */
const HOLDS: Readonly<Record<string, string>> = {
  'Payment History': 'Financial records kept 7 years (tax law)',
  'Exam Results': 'Official results kept for certificate verification',
  'Safeguarding Reports': 'Kept until the case is closed plus 6 years',
};

export function deletionPlan(scope: readonly string[]): { remove: readonly string[]; retain: readonly { item: string; why: string }[] } {
  return {
    remove: scope.filter((s) => !HOLDS[s]),
    retain: scope.filter((s) => HOLDS[s]).map((item) => ({ item, why: HOLDS[item] })),
  };
}

const LINK_HOURS = 72;

/** One decision on a request. Exports finish with a time-limited link; deletions start, keeping legal holds. */
export function decideRequest<T extends DataRequest>(r: T, action: 'approve' | 'reject' | 'requestInfo', opts: { now: string; note?: string }): { request: T; error?: string } {
  if (r.status === 'Completed' || r.status === 'Rejected') return { request: r, error: `${r.id} is already ${r.status.toLowerCase()}.` };
  if (action === 'reject') {
    if (!opts.note?.trim()) return { request: r, error: 'Give a reason; the requester is told and it is kept in the audit trail.' };
    return { request: { ...r, status: 'Rejected', note: opts.note.trim() } };
  }
  if (action === 'requestInfo') return { request: { ...r, status: 'Under Review', note: opts.note?.trim() || r.note } };
  const check = canRelease(r);
  if (!check.ok) return { request: r, error: check.reason };
  if (r.type === 'Deletion') {
    const plan = deletionPlan(r.scope);
    return { request: { ...r, status: 'Processing', retained: plan.retain.map((x) => x.item) } };
  }
  const expires = new Date(Date.parse(opts.now) + LINK_HOURS * 3_600_000).toISOString();
  return { request: { ...r, status: 'Completed', linkExpires: r.type === 'Correction' ? undefined : expires } };
}

/* ─── Support tickets ─── */

export type TicketStatus = 'Open' | 'In Progress' | 'Under Review' | 'Awaiting Customer' | 'Escalated' | 'Resolved';

export interface Ticket {
  id: string;
  status: TicketStatus;
  priority: 'High' | 'Medium' | 'Low';
  created: string;
  slaHours: number;
  notes: readonly string[];
  level?: string;
  assignee?: string;
}

const fmt = (min: number) => {
  const m = Math.abs(min);
  const h = Math.floor(m / 60);
  return h ? `${h}h ${m % 60}m` : `${m}m`;
};

/** Time left on the response SLA, or how long ago it was breached. */
export function slaState(t: Pick<Ticket, 'created' | 'slaHours'>, now: string): { minutesLeft: number; breached: boolean; label: string } {
  const minutesLeft = Math.round((Date.parse(t.created) + t.slaHours * 3_600_000 - Date.parse(now)) / 60_000);
  return minutesLeft >= 0 ? { minutesLeft, breached: false, label: `${fmt(minutesLeft)} left` } : { minutesLeft, breached: true, label: `Breached ${fmt(minutesLeft)} ago` };
}

/** Escalates a ticket and hands it to `to`, the L2 lead or the Trust & Safety queue. */
export function escalate<T extends Ticket>(t: T, level: 'L2' | 'Trust & Safety', by: string, to: string): T {
  const where = to === level ? level : `${level} (${to})`;
  const stop = by.endsWith('.') ? '' : '.';
  return { ...t, status: 'Escalated', level, assignee: to, notes: [`Escalated to ${where} by ${by}${stop}`, ...t.notes] };
}

export function closeTicket<T extends Ticket>(t: T, resolution: string): { ticket: T; error?: string } {
  if (!resolution.trim()) return { ticket: t, error: 'Write the resolution; the user sees it in their confirmation.' };
  return { ticket: { ...t, status: 'Resolved', notes: [`Resolved: ${resolution.trim()}`, ...t.notes] } };
}

/* ─── Security dashboard ─── */

export interface RlsPolicy {
  table: string;
  enforced: boolean;
  /** Rows a test tenant could read that belong to another tenant. */
  crossTenantRows: number;
}

/** Row-level-security audit: every tenant table must enforce its policy and leak nothing across tenants. */
export function runRlsAudit<T extends RlsPolicy>(list: readonly T[]): readonly (T & { result: 'Pass' | 'Fail'; why?: string })[] {
  return list.map((p) => {
    if (!p.enforced) return { ...p, result: 'Fail' as const, why: 'Policy not enforced' };
    if (p.crossTenantRows > 0) return { ...p, result: 'Fail' as const, why: `${p.crossTenantRows} rows visible to another tenant` };
    return { ...p, result: 'Pass' as const };
  });
}

export type AlertStatus = 'Open' | 'Contained' | 'Resolved';

/** Cross-tenant alerts: contain first (revoke, isolate), then resolve with a note. */
export function advanceAlert<T extends { id: string; status: AlertStatus; note?: string }>(a: T, note?: string): { alert: T; error?: string } {
  if (a.status === 'Open') return { alert: { ...a, status: 'Contained' } };
  if (a.status === 'Contained') {
    if (!note?.trim()) return { alert: a, error: 'Add a note saying how it was fixed before resolving.' };
    return { alert: { ...a, status: 'Resolved', note: note.trim() } };
  }
  return { alert: a };
}
