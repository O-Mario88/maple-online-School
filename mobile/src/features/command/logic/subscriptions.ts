/**
 * Rules behind Maple Command › Finance › Subscription Management: recurring revenue (MRR and ARR,
 * which are not cash or earned revenue), plan changes with proration, cancellations, renewals, the
 * failed-payment recovery workflow, and the accounting entries each billing event posts.
 */

export type PlanType = 'School' | 'Learner';
export type Billing = 'Monthly' | 'Termly' | 'Annual';
export type SubStatus = 'Active' | 'Trial' | 'Past Due' | 'Cancelled';

export interface Plan {
  id: string;
  name: string;
  type: PlanType;
  /** Monthly list price in UGX. */
  price: number;
}

export interface Sub {
  id: string;
  subscriber: string;
  plan: string;
  billing: Billing;
  start: string;
  nextRenewal: string;
  status: SubStatus;
  failedAttempts: number;
  endsOn?: string;
  cancelReason?: string;
}

const DAY_MS = 86_400_000;
const days = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / DAY_MS);
const priceOf = (id: string, plans: readonly Plan[]) => plans.find((p) => p.id === id)?.price ?? 0;

/** What the subscription adds to MRR: its monthly price while active or past due. */
export function monthlyValue(s: Pick<Sub, 'plan' | 'status'>, plans: readonly Plan[]): number {
  return s.status === 'Active' || s.status === 'Past Due' ? priceOf(s.plan, plans) : 0;
}

export function mrr(list: readonly Sub[], plans: readonly Plan[]): number {
  return list.reduce((t, s) => t + monthlyValue(s, plans), 0);
}

const MONTHS_PER_YEAR = 12;

export function arr(list: readonly Sub[], plans: readonly Plan[]): number {
  return mrr(list, plans) * MONTHS_PER_YEAR;
}

export function netRecurring(r: { base: number; upgrades: number; downgrades: number; cancellations: number }): number {
  return r.base + r.upgrades - r.downgrades - r.cancellations;
}

const CYCLE_MONTHS: Readonly<Record<Billing, number>> = { Monthly: 1, Termly: 4, Annual: 12 };

/**
 * Moves to another plan now. The difference for the rest of the current cycle is charged (upgrade)
 * or credited (downgrade).
 */
export function changePlan<T extends Sub>(s: T, planId: string, plans: readonly Plan[], today: string): { sub: T; kind: 'Upgrade' | 'Downgrade'; proration: number; error?: string } {
  if (planId === s.plan) return { sub: s, kind: 'Upgrade', proration: 0, error: `${s.subscriber} is already on this plan.` };
  const from = priceOf(s.plan, plans);
  const to = priceOf(planId, plans);
  const cycleStart = new Date(Date.parse(s.nextRenewal));
  cycleStart.setUTCMonth(cycleStart.getUTCMonth() - CYCLE_MONTHS[s.billing]);
  const start = Math.max(Date.parse(s.start), cycleStart.getTime());
  const cycleDays = Math.max(1, days(new Date(start).toISOString().slice(0, 10), s.nextRenewal));
  const left = Math.max(0, days(today, s.nextRenewal));
  const proration = Math.round((to - from) * CYCLE_MONTHS[s.billing] * (left / cycleDays));
  return { sub: { ...s, plan: planId }, kind: to > from ? 'Upgrade' : 'Downgrade', proration };
}

/** Cancels at the end of the paid period; a reason is required for churn reporting. */
export function cancel<T extends Sub>(s: T, reason: string, _today: string): { sub: T; error?: string } {
  if (!reason.trim()) return { sub: s, error: 'Give a reason for the cancellation.' };
  if (s.status === 'Cancelled') return { sub: s, error: `${s.subscriber} is already cancelled.` };
  return { sub: { ...s, status: 'Cancelled', endsOn: s.nextRenewal, cancelReason: reason.trim() } };
}

export function renewalsDue<T extends Sub>(list: readonly T[], today: string, within: number): readonly T[] {
  return list.filter((s) => s.status !== 'Cancelled' && days(today, s.nextRenewal) >= 0 && days(today, s.nextRenewal) <= within);
}

/** Retry on day 1, 3 and 7 after a failure; after three failed retries the subscription is suspended. */
const RETRY_DAYS: readonly number[] = [1, 3, 7];

export function dunningStep(failedAttempts: number): { action: 'Retry' | 'Suspend'; inDays: number } {
  return failedAttempts < RETRY_DAYS.length ? { action: 'Retry', inDays: RETRY_DAYS[failedAttempts] } : { action: 'Suspend', inDays: 0 };
}

export function recoverPayment<T extends Sub>(s: T): T {
  return { ...s, status: 'Active', failedAttempts: 0 };
}

export type BillingEvent = 'charge' | 'collect' | 'recognise' | 'refund';
const ENTRY: Readonly<Record<BillingEvent, [string, string]>> = {
  charge: ['1200 Accounts Receivable', '2400 Deferred Revenue'],
  collect: ['1100 Bank', '1200 Accounts Receivable'],
  recognise: ['2400 Deferred Revenue', '4100 Subscription Revenue'],
  refund: ['2400 Deferred Revenue', '1100 Bank'],
};

/** The balanced journal lines the Auto Accountant posts for a billing event. */
export function chargeEntries(event: BillingEvent, amount: number): readonly { account: string; debit: number; credit: number }[] {
  const [dr, cr] = ENTRY[event];
  return [
    { account: dr, debit: amount, credit: 0 },
    { account: cr, debit: 0, credit: amount },
  ];
}
