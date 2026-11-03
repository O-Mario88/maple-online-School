/**
 * Rules behind Maple Command › Finance › Revenue Recognition: cash received is not revenue until it
 * is earned. Subscriptions earn straight-line over the contract, course access over the access
 * weeks and marketplace commissions on delivery; cancellations reverse what is still unearned.
 */

export type Method = 'straight' | 'access' | 'delivery';

export interface RevenueItem {
  id: string;
  total: number;
  cash: number;
  method: Method;
  /** YYYY-MM-DD; the first of the month for subscriptions. */
  start: string;
  /** Months for straight-line, weeks for course access. */
  periods: number;
  delivered?: boolean;
  cancelled?: string;
}

const DAY_MS = 86_400_000;
const WEEK_DAYS = 7;

const parts = (iso: string) => iso.split('-').map(Number) as [number, number, number];
const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

/** Whole months from `start` (the 1st) to `asOf`; a month counts once its last day is reached. */
export function monthsElapsed(start: string, asOf: string): number {
  const [y1, m1] = parts(start);
  const [y2, m2, d2] = parts(asOf);
  const n = (y2 - y1) * 12 + (m2 - m1) + (d2 === lastDay(y2, m2) ? 1 : 0);
  return Math.max(0, n);
}

const elapsed = (item: RevenueItem, asOf: string) =>
  item.method === 'straight' ? Math.min(item.periods, monthsElapsed(item.start, asOf)) : Math.min(item.periods, Math.floor((Date.parse(asOf) - Date.parse(item.start)) / DAY_MS / WEEK_DAYS));

export function recognise(item: RevenueItem, asOf: string): { recognized: number; deferred: number; status: 'Active' | 'Completed' | 'Recognized' } {
  if (item.method === 'delivery') {
    const recognized = item.delivered ? item.total : 0;
    return { recognized, deferred: item.total - recognized, status: item.delivered ? 'Recognized' : 'Active' };
  }
  const done = Math.max(0, elapsed(item, asOf));
  const recognized = Math.round((item.total * done) / item.periods);
  return { recognized, deferred: item.total - recognized, status: done >= item.periods ? 'Completed' : 'Active' };
}

/** The next recognition: the first of next month for subscriptions, the next access week for courses. */
export function nextRecognition(item: RevenueItem, asOf: string): { date: string; amount: number } | null {
  if (item.method === 'delivery' || item.cancelled || recognise(item, asOf).status === 'Completed') return null;
  if (item.method === 'access') {
    const next = Date.parse(item.start) + (elapsed(item, asOf) + 1) * WEEK_DAYS * DAY_MS;
    return { date: new Date(next).toISOString().slice(0, 10), amount: Math.round(item.total / item.periods) };
  }
  const [y, m] = parts(asOf);
  const next = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
  return { date: next, amount: Math.round(item.total / item.periods) };
}

/** Cancels on `on`: what was earned stays revenue; the unearned rest is reversed for refund. */
export function cancelItem(item: RevenueItem, on: string) {
  const { recognized } = recognise(item, on);
  const reversed = item.total - recognized;
  return {
    earned: recognized,
    reversed,
    status: 'Cancelled' as const,
    entry: [
      { account: '2400 Deferred Revenue', debit: reversed, credit: 0 },
      { account: '2410 Refunds Payable', debit: 0, credit: reversed },
    ],
  };
}

export function rollForward(r: { opening: number; prepayments: number; recognized: number; cancellations: number }): number {
  return r.opening + r.prepayments - r.recognized - r.cancellations;
}
