/**
 * Rules behind Maple Command › Finance › Teacher Payables & Liability Register. Every earning
 * creates a payable, disbursements reduce it and adjustments post journal entries. What a teacher
 * is owed (earned less paid) is kept apart from what they may withdraw now: reserves, disputes
 * and holds stay owed and visible in the register until they are released.
 */

export interface TeacherPayable {
  id: string;
  name: string;
  earned: number;
  paid: number;
  /** Rolling reserve held back from earnings. */
  reserve: number;
  /** Earnings under dispute. */
  dispute: number;
  /** A missing requirement that blocks payout, such as a tax ID or KYC. */
  hold?: string;
}

export type Eligibility = 'Eligible' | 'Below Minimum' | 'On Hold' | 'Dispute';

export interface EntryLine {
  account: string;
  debit: number;
  credit: number;
}

const EXPENSE = '5100 Teacher Earnings';
const PAYABLE = '2300 Teacher Payables';
const BANK = '1100 Bank – Payouts';
/** Share of each earning held back as a rolling reserve. */
export const RESERVE_RATE = 0.05;
/** The smallest payout Maple sends. */
export const MIN_PAYOUT = 50_000;

const dr = (account: string, amount: number): EntryLine => ({ account, debit: amount, credit: 0 });
const cr = (account: string, amount: number): EntryLine => ({ account, debit: 0, credit: amount });

export const owed = (t: TeacherPayable): number => Math.max(0, t.earned - t.paid);
export const awaiting = (t: TeacherPayable): number => Math.max(0, owed(t) - t.reserve - t.dispute);

export function eligibility(t: TeacherPayable): Eligibility {
  if (t.dispute > 0) return 'Dispute';
  if (t.hold) return 'On Hold';
  return awaiting(t) >= MIN_PAYOUT ? 'Eligible' : 'Below Minimum';
}

export const withdrawable = (t: TeacherPayable): number => (eligibility(t) === 'Eligible' ? awaiting(t) : 0);

export function liability(list: readonly TeacherPayable[]): { awaiting: number; reserve: number; dispute: number; total: number } {
  const sum = (f: (t: TeacherPayable) => number) => list.reduce((s, t) => s + f(t), 0);
  const a = sum(awaiting);
  const r = sum((t) => t.reserve);
  const d = sum((t) => t.dispute);
  return { awaiting: a, reserve: r, dispute: d, total: a + r + d };
}

export function recordEarning<T extends TeacherPayable>(t: T, amount: number): { payable: T; entry: EntryLine[] } {
  return { payable: { ...t, earned: t.earned + amount, reserve: t.reserve + Math.round(amount * RESERVE_RATE) }, entry: [dr(EXPENSE, amount), cr(PAYABLE, amount)] };
}

export function disburse<T extends TeacherPayable>(t: T, amount: number): { payable?: T; entry?: EntryLine[]; error?: string } {
  const status = eligibility(t);
  if (status === 'On Hold') return { error: `${t.name} is on hold: ${t.hold}.` };
  if (status === 'Dispute') return { error: `${t.name} has a dispute open; resolve it before paying out.` };
  if (!(amount > 0) || amount > withdrawable(t)) return { error: `${t.name} can withdraw up to ${withdrawable(t).toLocaleString('en-US')}.` };
  return { payable: { ...t, paid: t.paid + amount }, entry: [dr(PAYABLE, amount), cr(BANK, amount)] };
}

/** A manual correction to earnings, always with a reason and a journal entry. */
export function adjust<T extends TeacherPayable>(t: T, amount: number, reason: string): { payable?: T; entry?: EntryLine[]; error?: string } {
  if (!reason.trim()) return { error: 'Give the reason for the adjustment; it goes on the journal entry.' };
  if (!amount) return { error: 'Enter the adjustment amount (negative to reduce earnings).' };
  if (amount < 0 && -amount > awaiting(t)) return { error: 'That would take the payable below zero after reserves and disputes.' };
  const size = Math.abs(amount);
  const entry = amount > 0 ? [dr(EXPENSE, size), cr(PAYABLE, size)] : [dr(PAYABLE, size), cr(EXPENSE, size)];
  return { payable: { ...t, earned: t.earned + amount }, entry };
}

export function openDispute<T extends TeacherPayable>(t: T, amount: number): { payable?: T; error?: string } {
  if (!(amount > 0) || amount > awaiting(t)) return { error: `A dispute can hold up to the ${awaiting(t).toLocaleString('en-US')} awaiting release.` };
  return { payable: { ...t, dispute: t.dispute + amount } };
}

/** Resolves the dispute: in the teacher's favour it returns to awaiting; otherwise the earnings are reversed. */
export function resolveDispute<T extends TeacherPayable>(t: T, teacherWins: boolean): { payable: T; entry?: EntryLine[] } {
  if (teacherWins) return { payable: { ...t, dispute: 0 } };
  return { payable: { ...t, dispute: 0, earned: t.earned - t.dispute }, entry: [dr(PAYABLE, t.dispute), cr(EXPENSE, t.dispute)] };
}

export function releaseReserve<T extends TeacherPayable>(t: T, amount: number): T {
  return { ...t, reserve: Math.max(0, t.reserve - amount) };
}

export function batchFor(list: readonly TeacherPayable[]): { teachers: number; total: number; skipped: number } {
  const ok = list.filter((t) => withdrawable(t) > 0);
  return { teachers: ok.length, total: ok.reduce((s, t) => s + withdrawable(t), 0), skipped: list.length - ok.length };
}
