/**
 * Rules behind Maple Command › Finance › Invoices: institutional and independent-learner invoices,
 * their totals, payments, credit notes, reminders and numbering. Every change is written to the
 * invoice's audit history.
 */

export type Currency = 'UGX' | 'KES' | 'TZS' | 'RWF' | 'USD';
export type InvoiceType = 'Institution' | 'Student';
export type InvoiceStatus = 'Draft' | 'Pending' | 'Partially Paid' | 'Paid' | 'Overdue';

export interface InvoiceLine {
  description: string;
  qty: number;
  unitPrice: number;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string;
  receipt: string;
}

export interface CreditNote {
  id: string;
  number: string;
  amount: number;
  reason: string;
  date: string;
}

export interface AuditEntry {
  at: string;
  by: string;
  action: string;
}

export interface Invoice {
  id: string;
  number: string;
  type: InvoiceType;
  customer: string;
  currency: Currency;
  issueDate: string;
  dueDate: string;
  lines: readonly InvoiceLine[];
  /** A flat amount off the subtotal, before tax. */
  discount: number;
  /** 0.18 for VAT at 18%; tuition is exempt (0). */
  taxRate: number;
  payments: readonly Payment[];
  credits: readonly CreditNote[];
  audit: readonly AuditEntry[];
  draft?: boolean;
  /** Independent learners: their age decides who is billed. */
  learnerAge?: number;
  guardian?: { name: string; verified: boolean };
}

/** Currencies billed in whole units; the rest in cents. */
const WHOLE: ReadonlySet<Currency> = new Set(['UGX', 'KES', 'TZS', 'RWF']);
const ADULT = 18;
const DAY_MS = 86_400_000;

function round(n: number, currency: Currency): number {
  return WHOLE.has(currency) ? Math.round(n) : Math.round(n * 100) / 100;
}

export function formatMoney(n: number, currency: Currency): string {
  const digits = WHOLE.has(currency) ? 0 : 2;
  return `${currency} ${n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

export function invoiceTotals(inv: Invoice): { subtotal: number; discount: number; tax: number; total: number; paid: number; credited: number; balance: number } {
  const c = inv.currency;
  const subtotal = round(
    inv.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0),
    c,
  );
  const discount = Math.min(inv.discount, subtotal);
  const tax = round((subtotal - discount) * inv.taxRate, c);
  const total = round(subtotal - discount + tax, c);
  const paid = round(
    inv.payments.reduce((s, p) => s + p.amount, 0),
    c,
  );
  const credited = round(
    inv.credits.reduce((s, x) => s + x.amount, 0),
    c,
  );
  return { subtotal, discount, tax, total, paid, credited, balance: round(Math.max(0, total - paid - credited), c) };
}

export function invoiceStatus(inv: Invoice, today: string): InvoiceStatus {
  if (inv.draft) return 'Draft';
  const t = invoiceTotals(inv);
  if (t.balance <= 0) return 'Paid';
  if (Date.parse(today) > Date.parse(inv.dueDate)) return 'Overdue';
  return t.paid + t.credited > 0 ? 'Partially Paid' : 'Pending';
}

const suffix = (inv: Invoice) => inv.number.replace(/^INV-/, '');
const log = (inv: Invoice, at: string, by: string, action: string): readonly AuditEntry[] => [{ at, by, action }, ...inv.audit];

/** Records a payment (full or part) and issues its receipt. */
export function recordPayment<T extends Invoice>(inv: T, p: { amount: number; date: string; method: string; by: string }): { invoice: T; error?: string } {
  if (inv.draft) return { invoice: inv, error: 'Issue the draft before recording payments.' };
  if (!(p.amount > 0)) return { invoice: inv, error: 'The payment must be more than zero.' };
  const { balance } = invoiceTotals(inv);
  if (p.amount > balance) return { invoice: inv, error: `That is more than the balance of ${formatMoney(balance, inv.currency)}.` };
  const n = inv.payments.length + 1;
  const payment: Payment = { id: `${inv.id}-p${n}`, amount: round(p.amount, inv.currency), date: p.date, method: p.method, receipt: `RCT-${suffix(inv)}-${n}` };
  return { invoice: { ...inv, payments: [...inv.payments, payment], audit: log(inv, p.date, p.by, `Payment of ${formatMoney(payment.amount, inv.currency)} recorded (${p.method})`) } };
}

/** A credit note takes an amount off what is owed; it needs a reason. */
export function issueCreditNote<T extends Invoice>(inv: T, c: { amount: number; reason: string; date: string; by: string }): { invoice: T; error?: string } {
  if (!c.reason.trim()) return { invoice: inv, error: 'Give a reason for the credit note.' };
  if (!(c.amount > 0)) return { invoice: inv, error: 'The credit must be more than zero.' };
  const { balance } = invoiceTotals(inv);
  if (c.amount > balance) return { invoice: inv, error: `A credit note cannot be more than the balance of ${formatMoney(balance, inv.currency)}.` };
  const n = inv.credits.length + 1;
  const note: CreditNote = { id: `${inv.id}-c${n}`, number: `CN-${suffix(inv)}-${n}`, amount: round(c.amount, inv.currency), reason: c.reason.trim(), date: c.date };
  return { invoice: { ...inv, credits: [...inv.credits, note], audit: log(inv, c.date, c.by, `Credit note ${note.number} for ${formatMoney(note.amount, inv.currency)}: ${note.reason}`) } };
}

/** Sends a payment reminder with the payment link; paid invoices get none. */
export function sendReminder<T extends Invoice>(inv: T, today: string, by: string): { invoice: T; message: string; error?: string } {
  const { balance } = invoiceTotals(inv);
  if (balance <= 0) return { invoice: inv, message: '', error: `${inv.number} is already paid.` };
  const days = Math.round((Date.parse(today) - Date.parse(inv.dueDate)) / DAY_MS);
  const when = days > 0 ? `${days} day${days === 1 ? '' : 's'} overdue` : days === 0 ? 'due today' : `due in ${-days} day${days === -1 ? '' : 's'}`;
  const message = `${inv.number} for ${inv.customer}: ${formatMoney(balance, inv.currency)} ${when}. Pay at ${paymentLink(inv)}`;
  return { invoice: { ...inv, audit: log(inv, today, by, `Reminder sent (${when})`) }, message };
}

/** The next number for the day: INV-YYYYMMDD-NNN, never reused. */
export function nextInvoiceNumber(existing: readonly string[], date: string): string {
  const day = date.replace(/-/g, '');
  const prefix = `INV-${day}-`;
  const top = existing.filter((n) => n.startsWith(prefix)).reduce((m, n) => Math.max(m, Number(n.slice(prefix.length)) || 0), 0);
  return `${prefix}${String(top + 1).padStart(3, '0')}`;
}

/** Learners under 18 are billed to a verified parent or guardian. */
export function canIssue(inv: Pick<Invoice, 'type' | 'learnerAge' | 'guardian' | 'lines'>): { ok: boolean; reason?: string } {
  if (!inv.lines.length) return { ok: false, reason: 'Add at least one item.' };
  if (inv.type === 'Student' && (inv.learnerAge ?? ADULT) < ADULT && !inv.guardian?.verified) return { ok: false, reason: 'A learner under 18 is billed to a verified parent or guardian.' };
  return { ok: true };
}

export function paymentLink(inv: Pick<Invoice, 'number'>): string {
  return `https://pay.maple.school/i/${inv.number}`;
}
