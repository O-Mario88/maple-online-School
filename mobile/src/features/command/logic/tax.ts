/** Rules behind Maple Command › Finance › Tax & Compliance: Uganda VAT, withholding tax, filings and eFRIS. */

export type TaxType = 'VAT' | 'WHT' | 'DST';
export type EfrisStatus = 'Submitted' | 'Pending' | 'Failed';

/** VAT 18%, withholding tax 6%, digital services tax 2%. */
export const TAX_RATES: Readonly<Record<TaxType, number>> = { VAT: 0.18, WHT: 0.06, DST: 0.02 };

export interface TaxTxn {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  taxable: number;
  taxType: TaxType;
  efris: EfrisStatus;
  efrisReceipt?: string;
}

export function taxFor(taxable: number, type: TaxType): number {
  return Math.round(taxable * TAX_RATES[type]);
}

/** What the customer pays (VAT and DST are added) or what Maple receives (withholding comes off). */
export function totalWithTax(t: Pick<TaxTxn, 'taxable' | 'taxType'>): number {
  const tax = taxFor(t.taxable, t.taxType);
  return t.taxType === 'WHT' ? t.taxable - tax : t.taxable + tax;
}

const ORDER: readonly TaxType[] = ['VAT', 'WHT', 'DST'];

/** Tax collected per type, with each type's share to one decimal place. */
export function taxBreakdown(list: readonly Pick<TaxTxn, 'taxable' | 'taxType'>[]): { total: number; rows: readonly { type: TaxType; amount: number; pct: number }[] } {
  const sums = ORDER.map((type) => ({ type, amount: list.filter((t) => t.taxType === type).reduce((s, t) => s + taxFor(t.taxable, type), 0) }));
  const total = sums.reduce((s, r) => s + r.amount, 0);
  return { total, rows: sums.filter((r) => r.amount > 0).map((r) => ({ ...r, pct: total ? Math.round((r.amount / total) * 1000) / 10 : 0 })) };
}

export interface Filing {
  id: string;
  title: string;
  due: string;
  done: boolean;
  filedOn?: string;
}

const DAY_MS = 86_400_000;
/** Inside three weeks a filing shows red; inside six weeks, orange. */
const URGENT_DAYS = 21;
const SOON_DAYS = 45;

const daysUntil = (due: string, today: string) => Math.round((Date.parse(due) - Date.parse(today)) / DAY_MS);
const plural = (n: number) => `${n} day${n === 1 ? '' : 's'}`;

export function filingState(f: Filing, today: string): { label: string; tone: 'red' | 'orange' | 'blue' | 'green' } {
  if (f.done) return { label: 'Completed', tone: 'green' };
  const days = daysUntil(f.due, today);
  if (days < 0) return { label: `Overdue by ${plural(-days)}`, tone: 'red' };
  if (days === 0) return { label: 'Due today', tone: 'red' };
  if (days <= URGENT_DAYS) return { label: `Due in ${plural(days)}`, tone: 'red' };
  if (days <= SOON_DAYS) return { label: `Due in ${plural(days)}`, tone: 'orange' };
  return { label: `In ${plural(days)}`, tone: 'blue' };
}

export function fileReturn<T extends Filing>(f: T, on: string): { filing: T; error?: string } {
  if (f.done) return { filing: f, error: `${f.title} is already filed.` };
  return { filing: { ...f, done: true, filedOn: on } };
}

/** Compliant while no return is past its deadline unfiled. */
export function complianceStatus(filings: readonly Filing[], today: string): 'Compliant' | 'Action Needed' {
  return filings.some((f) => !f.done && daysUntil(f.due, today) < 0) ? 'Action Needed' : 'Compliant';
}

/** Sends a receipt to URA's eFRIS again; an accepted one already has its fiscal number. */
export function resendToEfris<T extends TaxTxn>(t: T, seq: number): { txn: T; error?: string } {
  if (t.efris === 'Submitted') return { txn: t, error: `${t.id} is already accepted by eFRIS.` };
  return { txn: { ...t, efris: 'Submitted', efrisReceipt: `EFRIS-${t.date.replace(/-/g, '')}-${seq}` } };
}
