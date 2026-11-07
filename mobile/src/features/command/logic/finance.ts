/**
 * Platform money rules (Section 11B): settlement batches must balance, BYOS sales carry no
 * commission, teacher money sits in escrow until paid out, and big or risky payouts need two admins.
 */

export type BatchStatus = 'Settled' | 'Settling' | 'Mismatch';

export interface Batch {
  id: string;
  gross: number;
  fees: number;
  escrow: number;
  maple: number;
  status: BatchStatus;
}

/** Differences under this many shillings are rounding, not a mismatch. */
const TOLERANCE = 1;

/** Check a settlement batch: gross − fees must equal teacher escrow + Maple revenue. */
export function reconcile<T extends Batch>(b: T): { batch: T; balanced: boolean; diff: number } {
  const diff = Math.round(b.gross - b.fees - (b.escrow + b.maple));
  const balanced = Math.abs(diff) <= TOLERANCE;
  return { batch: { ...b, status: balanced ? 'Settled' : 'Mismatch' }, balanced, diff };
}

/** How a sale splits after processing fees: the teacher's escrow and Maple's commission (none for BYOS). */
export function split(gross: number, fees: number, commission: number, byos: boolean): { escrow: number; maple: number } {
  const net = gross - fees;
  const maple = byos ? 0 : Math.round(net * commission);
  return { escrow: net - maple, maple };
}

/** Totals across batches; Maple's net revenue is what is left after fees and teacher escrow. */
export function summarise(list: readonly Batch[]): { gross: number; fees: number; escrow: number; maple: number; net: number } {
  const sum = (k: 'gross' | 'fees' | 'escrow' | 'maple') => list.reduce((s, b) => s + b[k], 0);
  const gross = sum('gross');
  const fees = sum('fees');
  const escrow = sum('escrow');
  return { gross, fees, escrow, maple: sum('maple'), net: gross - fees - escrow };
}

/* ─── Teacher payouts ─── */

export type PayoutStatus = 'Pending' | 'Awaiting 2nd' | 'Approved' | 'Held' | 'Rejected';
export type PayoutRisk = 'Low' | 'Med' | 'High';

export interface Payout {
  id: string;
  teacher: string;
  amount: number;
  risk: PayoutRisk;
  approvals: readonly string[];
  status: PayoutStatus;
}

/** Payouts at or above this need a second admin. */
export const DUAL_LIMIT = 2_000_000;

export function needsTwo(p: Pick<Payout, 'amount' | 'risk'>): boolean {
  return p.amount >= DUAL_LIMIT || p.risk === 'High';
}

/** One admin's approval. Dual-approval payouts wait for a different second admin. */
export function approvePayout<T extends Payout>(p: T, by: string): { payout: T; error?: string } {
  if (p.status === 'Approved') return { payout: p, error: `${p.teacher}'s payout is already approved.` };
  if (p.status === 'Rejected') return { payout: p, error: `${p.teacher}'s payout was rejected.` };
  if (p.approvals.includes(by)) return { payout: p, error: 'You already approved this payout. The second approval must come from a different admin.' };
  const approvals = [...p.approvals, by];
  const done = !needsTwo(p) || approvals.length >= 2;
  return { payout: { ...p, approvals, status: done ? 'Approved' : 'Awaiting 2nd' } };
}

/* ─── Retry queue ─── */

export const MAX_ATTEMPTS = 3;
const BASE_WAIT_MINUTES = 15;

/** Schedule another try for a failed transfer, waiting longer each time; after the last try a person takes over. */
export function retryJob(j: { id: string; attempts: number }): { attempts: number; status: 'Scheduled' | 'Manual Review'; waitMinutes: number } {
  if (j.attempts >= MAX_ATTEMPTS) return { attempts: j.attempts, status: 'Manual Review', waitMinutes: 0 };
  return { attempts: j.attempts + 1, status: 'Scheduled', waitMinutes: BASE_WAIT_MINUTES * 2 ** (j.attempts - 1) };
}
