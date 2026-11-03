/**
 * Rules behind Maple Command › Finance › Contracts & Commercial Agreements: annual value, status
 * by stage and days left, the lifecycle counts, and the changes a contract goes through.
 */

export type ContractType = 'Enterprise' | 'School Plan' | 'Content License' | 'Service';
export type Billing = 'Annual' | 'Termly' | 'Milestone';
export type Stage = 'Draft' | 'Negotiation' | 'Signed' | 'Terminated';
export type ContractStatus = 'Draft' | 'Negotiation' | 'Active' | 'Renewal Due' | 'Expiring' | 'Expired' | 'Terminated';

export interface Contract {
  id: string;
  institution: string;
  type: ContractType;
  /** Total contract value over the whole term. */
  value: number;
  /** Percent off the list price. */
  discount: number;
  /** Percent of the contract value owed to the account manager. */
  commissionRate: number;
  start: string;
  end: string;
  billing: Billing;
  stage: Stage;
}

const DAY_MS = 86_400_000;
const MONTHS_A_YEAR = 12;
const RENEWAL_WINDOW_DAYS = 90;
const EXPIRING_DAYS = 30;
const APPROVAL_DISCOUNT = 15;
const MAX_DISCOUNT = 25;
const SERVICE_COMMISSION = 4;
const STANDARD_COMMISSION = 3;

const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const addMonths = (day: string, months: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  return iso(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, d.getUTCDate()));
};
const addDays = (day: string, days: number) => iso(Date.parse(day) + days * DAY_MS);

/** Whole months from start to the day after end. */
function termMonths(c: Pick<Contract, 'start' | 'end'>): number {
  const a = new Date(`${c.start}T00:00:00Z`);
  const b = new Date(`${addDays(c.end, 1)}T00:00:00Z`);
  return Math.max(1, (b.getUTCFullYear() - a.getUTCFullYear()) * MONTHS_A_YEAR + (b.getUTCMonth() - a.getUTCMonth()));
}

/** Annual contract value. */
export function acv(c: Contract): number {
  return Math.round((c.value * MONTHS_A_YEAR) / termMonths(c));
}

export const commission = (c: Contract): number => Math.round((c.value * c.commissionRate) / 100);

export function daysToEnd(c: Contract, today: string): number {
  return Math.round((Date.parse(c.end) - Date.parse(today)) / DAY_MS);
}

export function contractStatus(c: Contract, today: string): ContractStatus {
  if (c.stage !== 'Signed') return c.stage;
  const days = daysToEnd(c, today);
  if (days < 0) return 'Expired';
  if (days <= EXPIRING_DAYS) return 'Expiring';
  if (days <= RENEWAL_WINDOW_DAYS) return 'Renewal Due';
  return 'Active';
}

export function lifecycle(list: readonly Contract[], today: string): Readonly<Record<'Draft' | 'Negotiation' | 'Active' | 'Renewal Due' | 'Expired', number>> {
  const s = list.map((c) => contractStatus(c, today));
  const count = (...xs: ContractStatus[]) => s.filter((x) => xs.includes(x)).length;
  return { Draft: count('Draft'), Negotiation: count('Negotiation'), Active: count('Active', 'Renewal Due', 'Expiring'), 'Renewal Due': count('Renewal Due', 'Expiring'), Expired: count('Expired') };
}

export interface NewContract {
  institution: string;
  type: ContractType;
  value: number;
  discount: number;
  start: string;
  years: number;
  billing: Billing;
}

export function createContract(n: NewContract, id: string): { contract?: Contract; error?: string } {
  if (!n.institution.trim()) return { error: 'Choose the institution.' };
  if (!(n.value > 0)) return { error: 'Enter the contract value.' };
  if (n.discount < 0 || n.discount > MAX_DISCOUNT) return { error: `The discount must be between 0 and ${MAX_DISCOUNT}%.` };
  if (!(n.years >= 1 && n.years <= 5)) return { error: 'The term must be 1 to 5 years.' };
  if (Number.isNaN(Date.parse(n.start))) return { error: 'Enter the start date as YYYY-MM-DD.' };
  const end = addDays(addMonths(n.start, n.years * MONTHS_A_YEAR), -1);
  const commissionRate = n.type === 'Service' ? SERVICE_COMMISSION : STANDARD_COMMISSION;
  return { contract: { id, institution: n.institution.trim(), type: n.type, value: n.value, discount: n.discount, commissionRate, start: n.start, end, billing: n.billing, stage: 'Draft' } };
}

export function advanceStage(c: Contract): Contract {
  if (c.stage === 'Draft') return { ...c, stage: 'Negotiation' };
  if (c.stage === 'Negotiation') return { ...c, stage: 'Signed' };
  return c;
}

/** Discounts above 15% need the Finance Director's approval; above 25% they are refused. */
export function setDiscount(c: Contract, discount: number, approved: boolean): { contract?: Contract; error?: string } {
  if (discount < 0 || discount > MAX_DISCOUNT) return { error: `Discounts are capped at ${MAX_DISCOUNT}%.` };
  if (discount > APPROVAL_DISCOUNT && !approved) return { error: `A discount above ${APPROVAL_DISCOUNT}% needs Finance Director approval.` };
  return { contract: { ...c, discount } };
}

/** Renews from the day after the end date for `years`, with `uplift` percent on the annual value. */
export function renew<T extends Contract>(c: T, years: number, uplift: number): T {
  const start = addDays(c.end, 1);
  const end = addDays(addMonths(start, years * MONTHS_A_YEAR), -1);
  return { ...c, start, end, value: Math.round(acv(c) * (1 + uplift / 100) * years), stage: 'Signed' };
}

export function terminate(c: Contract, reason: string): { contract?: Contract; error?: string } {
  if (!reason.trim()) return { error: 'Give the reason for ending the contract.' };
  return { contract: { ...c, stage: 'Terminated' } };
}
