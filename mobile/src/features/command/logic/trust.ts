/**
 * The review rules behind the Trust & Safety queues: what blocks an approval, what every decision
 * needs, and how the queue counts move. The AI pre-screens; a person always makes the decision.
 */

export type CheckState = 'ok' | 'warn' | 'fail';
export type AppStatus = 'ready' | 'review' | 'flagged' | 'info' | 'escalated' | 'approved' | 'rejected' | 'blocked';
export type Action = 'approve' | 'reject' | 'block' | 'requestInfo' | 'escalate';
export type Risk = 'Low' | 'Medium' | 'High';

export interface Check {
  label: string;
  state: CheckState;
}

export interface Decision {
  action: Action;
  by: string;
  note?: string;
  at?: string;
}

export interface Application {
  id: string;
  name: string;
  country: string;
  subjects: string;
  checks: readonly Check[];
  safeguarding: 'clear' | 'alert';
  status: AppStatus;
  history: readonly Decision[];
}

const FINAL: readonly AppStatus[] = ['approved', 'rejected', 'blocked'];

const NEXT: Readonly<Record<Action, AppStatus>> = {
  approve: 'approved',
  reject: 'rejected',
  block: 'blocked',
  requestInfo: 'info',
  escalate: 'escalated',
};

/** Why an application can't simply be approved: failed checks and open safeguarding alerts. */
export function blockers(a: Pick<Application, 'checks' | 'safeguarding'>): readonly string[] {
  const failed = a.checks.filter((c) => c.state === 'fail').map((c) => c.label);
  return a.safeguarding === 'alert' ? [...failed, 'Safeguarding alert open'] : failed;
}

/** One decision on one application. Returns the updated application, or an error saying what's missing. */
export function decide<T extends Application>(a: T, d: Decision): { app: T; error?: string } {
  if (FINAL.includes(a.status)) return { app: a, error: `${a.name} is already ${a.status}.` };
  const note = d.note?.trim();
  if ((d.action === 'reject' || d.action === 'block') && !note) return { app: a, error: 'Give a reason: the applicant sees it and it goes in the audit log.' };
  if (d.action === 'approve') {
    const blocked = blockers(a);
    if (blocked.length && !note) return { app: a, error: `Resolve or override first: ${blocked.join(', ')}. An override needs a written reason.` };
  }
  return { app: { ...a, status: NEXT[d.action], history: [{ ...d, note }, ...a.history] }, error: undefined };
}

/** Approve many at once; anything with a blocker is skipped and left for a person to look at. */
export function bulkApprove<T extends Application>(apps: readonly T[], ids: ReadonlySet<string>, by: string): { apps: readonly T[]; approved: readonly string[]; skipped: readonly string[] } {
  const approved: string[] = [];
  const skipped: string[] = [];
  const next = apps.map((a) => {
    if (!ids.has(a.id)) return a;
    const r = decide(a, { action: 'approve', by });
    if (r.error) {
      skipped.push(a.id);
      return a;
    }
    approved.push(a.id);
    return r.app;
  });
  return { apps: next, approved, skipped };
}

export type QueueTab = 'all' | 'ready' | 'review' | 'flagged' | 'approved' | 'rejected';

const IN_TAB: Readonly<Record<QueueTab, readonly AppStatus[]>> = {
  all: ['ready', 'review', 'flagged', 'info', 'escalated'],
  ready: ['ready'],
  review: ['review', 'info', 'escalated'],
  flagged: ['flagged'],
  approved: ['approved'],
  rejected: ['rejected', 'blocked'],
};

/** How many applications sit in each tab. */
export function countByStatus(apps: readonly Pick<Application, 'status'>[]): Readonly<Record<QueueTab, number>> {
  const count = (t: QueueTab) => apps.filter((a) => IN_TAB[t].includes(a.status)).length;
  return { all: count('all'), ready: count('ready'), review: count('review'), flagged: count('flagged'), approved: count('approved'), rejected: count('rejected') };
}

/** The applications in a tab whose name, id, country or subjects match the search. */
export function filterApps<T extends Application>(apps: readonly T[], tab: QueueTab, query: string): readonly T[] {
  const q = query.trim().toLowerCase();
  return apps.filter((a) => IN_TAB[tab].includes(a.status) && (!q || `${a.name} ${a.id} ${a.country} ${a.subjects}`.toLowerCase().includes(q)));
}

/** The AI's overall read: any failed check is high risk, any warning medium, otherwise low. */
export function overallRisk(checks: readonly Check[]): Risk {
  if (checks.some((c) => c.state === 'fail')) return 'High';
  if (checks.some((c) => c.state === 'warn')) return 'Medium';
  return 'Low';
}

/* ─── Hub cases: course quality, copyright, safeguarding, reports and appeals ─── */

export type CaseStatus = 'Open' | 'Needs Review' | 'Under Investigation' | 'Resolved' | 'Removed' | 'Upheld' | 'Overturned';
export type CaseAction = 'remove' | 'fix' | 'dismiss' | 'resolve' | 'escalate' | 'restrict' | 'uphold' | 'overturn' | 'requestInfo';

export interface CaseItem {
  id: string;
  title: string;
  risk: Risk;
  status: CaseStatus;
  note?: string;
}

const CASE_NEXT: Readonly<Record<CaseAction, CaseStatus>> = {
  remove: 'Removed',
  fix: 'Needs Review',
  dismiss: 'Resolved',
  resolve: 'Resolved',
  escalate: 'Under Investigation',
  restrict: 'Under Investigation',
  uphold: 'Upheld',
  overturn: 'Overturned',
  requestInfo: 'Open',
};
const CASE_CLOSED: readonly CaseStatus[] = ['Resolved', 'Removed', 'Upheld', 'Overturned'];
const CASE_NEEDS_REASON: readonly CaseAction[] = ['remove', 'restrict', 'uphold', 'overturn'];

/** Whether this action on this case must carry a written reason. */
export function caseNeedsReason(c: Pick<CaseItem, 'risk'>, action: CaseAction): boolean {
  return CASE_NEEDS_REASON.includes(action) || (action === 'dismiss' && c.risk === 'High');
}

/** One decision on a case; closed cases stay closed (reopen through an appeal). */
export function caseDecide<T extends CaseItem>(c: T, action: CaseAction, note?: string): { item: T; error?: string } {
  if (CASE_CLOSED.includes(c.status)) return { item: c, error: `${c.id} is closed (${c.status}). Reopen it through an appeal.` };
  const why = note?.trim();
  if (caseNeedsReason(c, action) && !why) return { item: c, error: 'Give a reason: it is shared with the owner and kept in the audit log.' };
  return { item: { ...c, status: CASE_NEXT[action], note: why || c.note } };
}
