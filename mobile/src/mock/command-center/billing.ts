/**
 * Maple Command › Finance › Invoices and Tax & Compliance sample data. Amounts are illustrative.
 * Statuses are not stored: the pages work them out from due dates and payments.
 */
import type { Invoice, InvoiceLine } from '@/features/command/logic/invoices';
import type { Filing, TaxTxn } from '@/features/command/logic/tax';

import type { KpiData } from './shared';

/** "Today" for the invoice and tax pages. */
export const TODAY = '2026-10-26';

export interface InvoiceRow extends Invoice {
  n: number;
  place: string;
  description: string;
  terms: string;
  contact: string;
  notes: string;
  recurring: boolean;
}

const D = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
export const dateLabel = D;

const line = (description: string, qty: number, unitPrice: number): InvoiceLine => ({ description, qty, unitPrice });
const total = (lines: readonly InvoiceLine[]) => lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);

interface Seed {
  n: number;
  no: string;
  type: Invoice['type'];
  customer: string;
  place: string;
  description: string;
  issue: string;
  due: string;
  lines: readonly InvoiceLine[];
  paid?: boolean;
  recurring?: boolean;
  age?: number;
  guardian?: string;
  contact?: string;
  notes?: string;
}

function build(s: Seed): InvoiceRow {
  const amount = total(s.lines);
  return {
    id: s.no,
    n: s.n,
    number: s.no,
    type: s.type,
    customer: s.customer,
    place: s.place,
    description: s.description,
    currency: 'UGX',
    issueDate: s.issue,
    dueDate: s.due,
    lines: s.lines,
    discount: 0,
    taxRate: 0,
    payments: s.paid ? [{ id: `${s.no}-p1`, amount, date: s.due, method: s.type === 'Institution' ? 'Bank Transfer' : 'Mobile Money (MoMo)', receipt: `RCT-${s.no.slice(4)}-1` }] : [],
    credits: [],
    audit: [
      ...(s.paid ? [{ at: D(s.due), by: 'Flutterwave webhook', action: `Paid in full (${s.type === 'Institution' ? 'Bank Transfer' : 'Mobile Money'})` }] : []),
      { at: D(s.issue), by: 'Mary N.', action: 'Invoice sent with payment link and QR code' },
      { at: D(s.issue), by: 'Mary N.', action: 'Invoice created' },
    ],
    learnerAge: s.age,
    guardian: s.guardian ? { name: s.guardian, verified: true } : undefined,
    terms: 'Net 14',
    contact: s.contact ?? (s.type === 'Institution' ? 'Bursar' : (s.guardian ?? s.customer)),
    notes: s.notes ?? s.description,
    recurring: s.recurring ?? s.type === 'Institution',
  };
}

const seeds: readonly Seed[] = [
  { n: 1, no: 'INV-20261026-001', type: 'Institution', customer: 'Green Valley Academy', place: 'Kampala', description: 'Term 3 Tuition (Primary)', issue: '2026-10-26', due: '2026-11-09', lines: [line('Primary Tuition', 100, 125_000)], paid: true },
  { n: 2, no: 'INV-20261025-004', type: 'Student', customer: 'Amina Namubiru', place: 'Individual', description: 'Math Mastery Subject', issue: '2026-10-25', due: '2026-11-08', lines: [line('Math Mastery Subject', 1, 250_000)], paid: true, age: 15, guardian: 'Sarah Namubiru' },
  {
    n: 3,
    no: 'INV-20261025-003',
    type: 'Institution',
    customer: 'Bright Future School',
    place: 'Gulu',
    description: 'Term 3 Tuition (Secondary)',
    issue: '2026-10-25',
    due: '2026-11-08',
    lines: [line('Secondary Tuition', 100, 150_000), line('LMS Access (Per Student)', 100, 25_000), line('Exam Preparation Pack', 50, 25_000)],
    contact: 'John Acaye (bursar@brightfuture.sc.ug)',
    notes: 'Term 3 tuition for 120 secondary students.',
  },
  { n: 4, no: 'INV-20261024-007', type: 'Student', customer: 'David Ojara', place: 'Individual', description: 'Science Revision Pack', issue: '2026-10-24', due: '2026-11-07', lines: [line('Science Revision Pack', 1, 150_000)], paid: true, age: 19 },
  { n: 5, no: 'INV-20260924-006', type: 'Institution', customer: "St. Mark's College", place: 'Jinja', description: 'Subscription – 50 Students', issue: '2026-09-24', due: '2026-10-08', lines: [line('Pro Plan Subscription (per student)', 50, 100_000)] },
  { n: 6, no: 'INV-20261023-012', type: 'Student', customer: 'Grace Akello', place: 'Individual', description: 'English Writing Subject', issue: '2026-10-23', due: '2026-11-06', lines: [line('English Writing Subject', 1, 200_000)], paid: true, age: 22 },
  { n: 7, no: 'INV-20261023-011', type: 'Institution', customer: 'Hope International', place: 'Lira', description: 'Term 3 Tuition (Primary)', issue: '2026-10-23', due: '2026-11-06', lines: [line('Primary Tuition', 80, 122_500)] },
  { n: 8, no: 'INV-20260922-008', type: 'Student', customer: 'Kevin Nsubuga', place: 'Individual', description: 'Live Class Package (1 month)', issue: '2026-09-22', due: '2026-10-06', lines: [line('Live Class Package (1 month)', 1, 300_000)], age: 16, guardian: 'Robert Nsubuga' },
  { n: 9, no: 'INV-20261021-015', type: 'Institution', customer: 'Sunrise Schools', place: 'Mbarara', description: 'Digital Literacy Program', issue: '2026-10-21', due: '2026-11-04', lines: [line('Digital Literacy Program', 150, 50_000)], paid: true },
  { n: 10, no: 'INV-20261021-014', type: 'Student', customer: 'Maria Lopez', place: 'Individual', description: 'Reading Bridge Subject', issue: '2026-10-21', due: '2026-11-04', lines: [line('Reading Bridge Subject', 1, 180_000)], paid: true, age: 12, guardian: 'Ana Lopez' },
  { n: 11, no: 'INV-20261020-017', type: 'Institution', customer: 'Cornerstone Academy', place: 'Mbale', description: 'Term 3 Tuition (Secondary)', issue: '2026-10-20', due: '2026-11-03', lines: [line('Secondary Tuition', 100, 142_000)] },
  { n: 12, no: 'INV-20260920-016', type: 'Student', customer: 'Samuel Okello', place: 'Individual', description: 'Holiday Bootcamp', issue: '2026-09-20', due: '2026-10-04', lines: [line('Holiday Bootcamp', 1, 350_000)], age: 17, guardian: 'Esther Okello', recurring: false },
];

export const invoices: readonly InvoiceRow[] = seeds.map(build);
/** The invoice the page opens with, as in the reference. */
export const featuredInvoice = 'INV-20261025-003';

export const invoiceStats: readonly KpiData[] = [
  { label: 'Total Invoiced', value: 'UGX 2.48B', delta: '28%', caption: 'vs. last month', icon: 'receipt', tone: 'blue' },
  { label: 'Paid', value: 'UGX 1.92B', delta: '78%', caption: 'vs. last month', icon: 'check', tone: 'green' },
  { label: 'Pending', value: 'UGX 412.6M', delta: '12%', caption: 'vs. last month', icon: 'clock', tone: 'orange' },
  { label: 'Overdue', value: 'UGX 152.9M', delta: '41%', down: true, caption: 'vs. last month', icon: 'alert', tone: 'red' },
  { label: 'Institutions', value: '158', delta: '12%', caption: 'active this month', icon: 'people', tone: 'purple' },
  { label: 'Independent Students', value: '624', delta: '24%', caption: 'active this month', icon: 'cap', tone: 'blue' },
];

/** The month's tab totals; the sample rows are the newest of them. */
export const invoiceTotals = { all: 446, Institution: 232, Student: 214, Draft: 12, Overdue: 68, Recurring: 176 };

/** What can be billed, with list prices in UGX. */
export const catalogue: readonly { item: string; price: number; for: Invoice['type'] }[] = [
  { item: 'Primary Tuition (per learner, term)', price: 125_000, for: 'Institution' },
  { item: 'Secondary Tuition (per learner, term)', price: 150_000, for: 'Institution' },
  { item: 'LMS Access (per learner, term)', price: 25_000, for: 'Institution' },
  { item: 'Pro Plan Subscription (per learner, month)', price: 100_000, for: 'Institution' },
  { item: 'Math Mastery Subject', price: 250_000, for: 'Student' },
  { item: 'Live Class Package (1 month)', price: 300_000, for: 'Student' },
  { item: 'One-to-one Tutoring (5 hours)', price: 175_000, for: 'Student' },
];

export const institutionCustomers = ['Green Valley Academy', 'Bright Future School', "St. Mark's College", 'Hope International', 'Sunrise Schools', 'Cornerstone Academy'];
export const learnerCustomers: readonly { name: string; age: number; guardian?: string }[] = [
  { name: 'Amina Namubiru', age: 15, guardian: 'Sarah Namubiru' },
  { name: 'Joel Mugisha', age: 13 },
  { name: 'Grace Akello', age: 22 },
];

/* ─── Tax & Compliance ─── */

export interface TaxRow extends TaxTxn {
  n: number;
  invoice: string;
  customer: string;
  kind: 'Institution' | 'Individual';
  type: string;
  method: string;
  notes: string;
}

const T = (n: number, day: number, customer: string, kind: TaxRow['kind'], type: string, taxable: number, taxType: TaxTxn['taxType'], efris: TaxTxn['efris'] = 'Submitted'): TaxRow => {
  const date = `2026-10-${String(day).padStart(2, '0')}`;
  const id = `TXN-202610${String(day).padStart(2, '0')}-${String(n).padStart(3, '0')}`;
  return { n, id, date, taxable, taxType, efris, efrisReceipt: efris === 'Submitted' ? `EFRIS-202610${String(day).padStart(2, '0')}-${7780 + n}` : undefined, invoice: `INV-202610${String(day).padStart(2, '0')}-${String(n).padStart(3, '0')}`, customer, kind, type, method: kind === 'Institution' ? 'Bank Transfer' : 'Mobile Money (MoMo)', notes: kind === 'Institution' ? 'Monthly subscription - 500 students' : 'Subject purchase' };
};

export const taxTxns: readonly TaxRow[] = [
  T(1, 26, 'Green Valley Academy', 'Institution', 'Invoice', 12_500_000, 'VAT'),
  T(2, 26, 'Amina Namubiru', 'Individual', 'Subject Purchase', 250_000, 'VAT'),
  T(3, 25, 'Bright Future School', 'Institution', 'Subscription', 18_750_000, 'VAT'),
  T(4, 25, 'David Ojara', 'Individual', 'Live Class', 150_000, 'VAT'),
  T(5, 24, "St. Mark's College", 'Institution', 'Invoice', 5_000_000, 'DST'),
  T(6, 24, 'Grace Akello', 'Individual', 'Tutoring Package', 200_000, 'VAT'),
  T(7, 23, 'Hope International', 'Institution', 'Invoice', 9_800_000, 'VAT', 'Pending'),
  T(8, 23, 'Kevin Nsubuga', 'Individual', 'Subject Purchase', 300_000, 'VAT'),
  T(9, 22, 'Sunrise Schools', 'Institution', 'Withholding', 7_500_000, 'WHT', 'Failed'),
  T(10, 21, 'Maria Lopez', 'Individual', 'Live Class', 180_000, 'VAT'),
];

export const taxStats: readonly KpiData[] = [
  { label: 'Total Tax Collected', value: 'UGX 412.6M', delta: '28%', caption: 'vs. last month', icon: 'database', tone: 'blue' },
  { label: 'VAT (18%)', value: 'UGX 368.4M', delta: '32%', caption: 'vs. last month', icon: 'chart', tone: 'green' },
  { label: 'Withholding Tax', value: 'UGX 28.4M', delta: '12%', caption: 'vs. last month', icon: 'person', tone: 'purple' },
  { label: 'Pending Filings', value: '3', delta: '50%', down: true, caption: 'require attention', icon: 'clock', tone: 'red' },
];

/** Month by month, in millions of UGX. */
export const taxTrend = {
  labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  vat: [96, 138, 172, 198, 236, 290],
  wht: [36, 44, 52, 58, 66, 66],
  other: [28, 34, 38, 44, 50, 56],
};

/** The October breakdown in UGX, for the donut. */
export const octoberTax = { VAT: 368_400_000, WHT: 28_400_000, DST: 8_200_000, Other: 7_600_000 };

export const filings: readonly Filing[] = [
  { id: 'vat-oct', title: 'VAT Return (Oct 2026)', due: '2026-11-15', done: false },
  { id: 'wht-q3', title: 'Withholding Tax (Q3 2026)', due: '2026-11-30', done: false },
  { id: 'efris-oct', title: 'eFRIS Submission (Oct 2026)', due: '2026-10-20', done: true, filedOn: 'Oct 20, 2026' },
  { id: 'annual', title: 'Annual Tax Reconciliation', due: '2027-01-31', done: false },
];

export const taxTabs = ['Transactions', 'Tax Filings', 'eFRIS', 'Withholding Tax', 'Exemptions & Zero-Rated', 'Compliance Documents', 'Audit Trail'];
export const exemptions: readonly { item: string; rule: string }[] = [
  { item: 'School tuition (pre-primary to secondary)', rule: 'Exempt — VAT Act, Second Schedule' },
  { item: 'Printed educational books', rule: 'Zero-rated' },
  { item: 'Platform fees, AI Copilot and subscriptions', rule: 'Standard rated (18%)' },
];

/** The tax page's audit trail so far. */
export const taxAudit: readonly string[] = ['Oct 26, 2026 14:32 • eFRIS sync completed (248 receipts)', 'Oct 20, 2026 09:10 • Mary N. filed eFRIS Submission (Oct 2026)'];
