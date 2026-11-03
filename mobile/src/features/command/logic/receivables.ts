/**
 * Rules behind Maple Command › Finance › Enterprise Accounts Receivable: aging of institutional
 * balances, the next collection step, payments against a contract, and promises to pay.
 */

export type Bucket = 'Current' | '31 – 60 Days' | '61 – 90 Days' | '> 90 Days';
export const BUCKETS: readonly Bucket[] = ['Current', '31 – 60 Days', '61 – 90 Days', '> 90 Days'];

export interface Receivable {
  id: string;
  institution: string;
  contractValue: number;
  invoiced: number;
  paid: number;
  /** Due date of the oldest invoice not yet paid. */
  oldestDue: string;
}

const DAY_MS = 86_400_000;
const CURRENT_DAYS = 30;
const MID_DAYS = 60;
const LATE_DAYS = 90;

export function balance(r: Pick<Receivable, 'invoiced' | 'paid'>): number {
  return Math.max(0, r.invoiced - r.paid);
}

export function agingBucket(r: Receivable, today: string): Bucket {
  if (!balance(r)) return 'Current';
  const days = Math.round((Date.parse(today) - Date.parse(r.oldestDue)) / DAY_MS);
  if (days <= CURRENT_DAYS) return 'Current';
  if (days <= MID_DAYS) return '31 – 60 Days';
  if (days <= LATE_DAYS) return '61 – 90 Days';
  return '> 90 Days';
}

export function agingSummary(list: readonly Receivable[], today: string): { total: number; buckets: readonly { bucket: Bucket; amount: number; pct: number }[] } {
  const total = list.reduce((s, r) => s + balance(r), 0);
  return {
    total,
    buckets: BUCKETS.map((bucket) => {
      const amount = list.filter((r) => agingBucket(r, today) === bucket).reduce((s, r) => s + balance(r), 0);
      return { bucket, amount, pct: total ? Math.round((amount / total) * 1000) / 10 : 0 };
    }),
  };
}

export type CommitmentStatus = 'On Track' | 'At Risk' | 'Overdue' | 'Kept';

export interface Commitment {
  id: string;
  receivable: string;
  amount: number;
  due: string;
  kept?: boolean;
  /** The institution missed an earlier promise. */
  brokenBefore?: boolean;
}

export function commitmentStatus(c: Commitment, today: string): CommitmentStatus {
  if (c.kept) return 'Kept';
  if (Date.parse(c.due) < Date.parse(today)) return 'Overdue';
  return c.brokenBefore ? 'At Risk' : 'On Track';
}

export type NextAction = '—' | 'Send Reminder' | 'Agree Payment' | 'Follow Up' | 'Collection Plan';

/** The collection step for a balance of this age, given any promise to pay. */
export function nextAction(bucket: Bucket, promised: CommitmentStatus | undefined): NextAction {
  if (bucket === 'Current') return '—';
  if (bucket === '31 – 60 Days') return promised ? 'Agree Payment' : 'Send Reminder';
  if (bucket === '61 – 90 Days') return 'Send Reminder';
  return promised === 'At Risk' || promised === 'Overdue' ? 'Collection Plan' : 'Follow Up';
}

export function recordCollection<T extends Receivable>(r: T, amount: number): { receivable: T; error?: string } {
  if (!(amount > 0)) return { receivable: r, error: 'Enter an amount above zero.' };
  if (amount > balance(r)) return { receivable: r, error: `That is more than the balance of ${balance(r).toLocaleString('en-US')}.` };
  return { receivable: { ...r, paid: r.paid + amount } };
}

export function promise(r: Receivable, amount: number, due: string, today: string): { commitment?: Commitment; error?: string } {
  if (!(amount > 0)) return { error: 'Enter the amount promised.' };
  if (amount > balance(r)) return { error: `The promise is more than the balance of ${balance(r).toLocaleString('en-US')}.` };
  if (!(Date.parse(due) > Date.parse(today))) return { error: 'The promised date must be in the future.' };
  return { commitment: { id: `${r.id}-${due}`, receivable: r.id, amount, due } };
}
