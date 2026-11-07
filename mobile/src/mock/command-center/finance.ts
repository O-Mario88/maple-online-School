/** Maple Command › Platform Revenue, Escrow & Commission Ledger and Teacher Payouts sample data (Section 11B). */
import type { Batch, Payout } from '@/features/command/logic/finance';

import { face, type KpiData, type Photo } from './shared';
import { Maple } from '@/constants/maple';

export type Provider = 'Stripe' | 'Flutterwave' | 'Paystack' | 'MTN MoMo' | 'Airtel Money';

export interface BatchRow extends Batch {
  n: number;
  provider: Provider;
  date: string;
  txns: number;
}

const B = (n: number, id: string, provider: Provider, date: string, txns: number, gross: number, fees: number, escrow: number, maple: number, status: Batch['status'] = 'Settled'): BatchRow => ({ n, id, provider, date, txns, gross, fees, escrow, maple, status });

const first: readonly BatchRow[] = [
  B(1, 'ST-20261031-001', 'Stripe', 'Oct 31, 2026', 2348, 485200000, 14556000, 346220000, 124424000),
  B(2, 'FW-20261030-001', 'Flutterwave', 'Oct 30, 2026', 1982, 412650000, 12379500, 296110000, 104160500),
  B(3, 'PAY-20261029-001', 'Paystack', 'Oct 29, 2026', 1456, 298400000, 8952000, 214990000, 74458000),
  B(4, 'MOMO-20261028-001', 'MTN MoMo', 'Oct 28, 2026', 3240, 612800000, 18384000, 441840000, 152576000),
  B(5, 'ST-20261027-001', 'Stripe', 'Oct 27, 2026', 2110, 435600000, 13068000, 313632000, 108900000),
  B(6, 'FW-20261026-001', 'Flutterwave', 'Oct 26, 2026', 1876, 368900000, 11067000, 265608000, 92225000),
  B(7, 'PAY-20261025-001', 'Paystack', 'Oct 25, 2026', 1342, 278450000, 8353500, 200484000, 69612500, 'Settling'),
  B(8, 'MOMO-20261024-001', 'Airtel Money', 'Oct 24, 2026', 1978, 352600000, 10578000, 253872000, 88150000),
  B(9, 'ST-20261023-001', 'Stripe', 'Oct 23, 2026', 1654, 298750000, 8962500, 215100000, 74687500),
  B(10, 'FW-20261022-001', 'Flutterwave', 'Oct 22, 2026', 1834, 327800000, 9834000, 235008000, 82958000),
];

const PROVIDERS: readonly [Provider, string][] = [['Stripe', 'ST'], ['Flutterwave', 'FW'], ['Paystack', 'PAY'], ['MTN MoMo', 'MOMO'], ['Airtel Money', 'MOMO']];
const MONTHS = ['Oct', 'Sep', 'Aug', 'Jul', 'Jun', 'May', 'Apr', 'Mar', 'Feb'];

/** Older batches to 248 in all; two are left unbalanced so reconciliation has something to catch. */
function generated(): readonly BatchRow[] {
  const out: BatchRow[] = [];
  for (let n = 11; n <= 248; n++) {
    const [provider, code] = PROVIDERS[n % PROVIDERS.length];
    const day = 31 - ((n - 1) % 30);
    const month = MONTHS[Math.floor((n - 1) / 30)] ?? 'Feb';
    const gross = 180000000 + ((n * 7919) % 300) * 1000000;
    const fees = Math.round(gross * 0.03);
    const maple = Math.round((gross - fees) * 0.26);
    const off = n === 37 || n === 112 ? 2450000 : 0;
    out.push(B(n, `${code}-2026${String(10 - Math.floor((n - 1) / 30)).padStart(2, '0')}${String(day).padStart(2, '0')}-${String(1 + (n % 3)).padStart(3, '0')}`, provider, `${month} ${day}, 2026`, 900 + ((n * 37) % 2400), gross, fees, gross - fees - maple - off, maple, n === 37 || n === 112 ? 'Settling' : 'Settled'));
  }
  return out;
}

export const batches: readonly BatchRow[] = [...first, ...generated()];

export const revenueStats: readonly KpiData[] = [
  { label: 'Total GMV', value: 'UGX 2.48B', delta: '28%', caption: 'vs. last month', icon: 'database', tone: 'blue' },
  { label: 'Maple Net Revenue', value: 'UGX 612.4M', delta: '32%', caption: 'vs. last month', icon: 'chart', tone: 'green' },
  { label: 'Teacher Escrow Liability', value: 'UGX 1.79B', delta: '24%', caption: 'pending/held for payouts', icon: 'shield', tone: 'purple' },
  { label: 'Marketplace Commission', value: 'UGX 612.4M', caption: 'effective commission rate', icon: 'percent', tone: 'orange' },
  { label: 'BYOS Revenue (0%)', value: 'UGX 0', caption: 'of total GMV', icon: 'cap', tone: 'blue' },
  { label: 'Total Transactions', value: '24,832', delta: '27%', caption: 'vs. last month', icon: 'doc', tone: 'orange' },
];

/** October in shillings: the summary panel's figures (net = gross − fees − escrow). */
export const october = { gross: 2482150000, fees: 74463000, escrow: 1794980000, commissionRate: 24.7, marketplaceTxns: 24216, byosTxns: 616 };

export const breakdown = {
  months: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  escrow: [0.52, 0.6, 0.78, 0.92, 1.05, 1.38],
  maple: [0.2, 0.22, 0.26, 0.32, 0.38, 0.5],
  fees: [0.09, 0.1, 0.12, 0.16, 0.2, 0.22],
  byos: [0.06, 0.06, 0.08, 0.1, 0.12, 0.25],
};

export const methods: readonly { label: string; pct: number; color: string }[] = [
  { label: 'Mobile Money (MoMo)', pct: 42, color: Maple.blue },
  { label: 'Card Payments (Stripe)', pct: 28, color: Maple.successText },
  { label: 'Flutterwave', pct: 18, color: Maple.blue },
  { label: 'Paystack', pct: 9, color: Maple.warning },
  { label: 'Bank Transfer', pct: 3, color: Maple.blueLine },
];

export const marketVsByos = {
  months: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  market: [0.85, 0.82, 0.95, 1.08, 1.12, 2.1],
  byos: [0.06, 0.06, 0.07, 0.08, 0.09, 0.1],
  commission: [41, 46, 48, 51, 52, 53],
};

export const revenueTabs = ['Settlement Batches', 'Escrow & Teacher Liabilities', 'Maple Revenue Ledger', 'Teacher Payouts', 'Platform Fees', 'Transactions'];

/* ─── Payouts ─── */

export interface PayoutRow extends Payout {
  n: number;
  school: string;
  method: 'MoMo' | 'Bank Transfer' | 'Stripe' | 'Mobile Money';
  submitted: string;
  avatar: Photo;
}

const P = (n: number, teacher: string, school: string, amount: number, method: PayoutRow['method'], risk: Payout['risk'], submitted: string, avatar: Photo): PayoutRow => ({ n, id: `PO-${1000 + n}`, teacher, school, amount, method, risk, submitted, avatar, approvals: [], status: 'Pending' });

const firstPayouts: readonly PayoutRow[] = [
  P(1, 'Sarah Namubiru', 'Green Valley Academy', 3250000, 'MoMo', 'High', 'Oct 31, 09:24 AM', face.sarah),
  P(2, 'James Okello', 'Bright Future School', 1850000, 'Bank Transfer', 'Low', 'Oct 31, 08:50 AM', face.james),
  P(3, 'Grace Achieng', 'Sunrise Primary', 2100000, 'MoMo', 'Med', 'Oct 31, 08:12 AM', face.grace),
  P(4, 'Peter Atim', 'Hope International', 950000, 'Stripe', 'Low', 'Oct 31, 07:45 AM', face.okello),
  P(5, 'Ruth Kato', 'Faith Christian School', 1200000, 'Mobile Money', 'Med', 'Oct 31, 07:20 AM', face.ruth),
  P(6, 'Daniel Mugisha', 'Cornerstone Academy', 2750000, 'MoMo', 'High', 'Oct 31, 06:55 AM', face.michael),
  P(7, 'Mary Wanjiku', 'Light of Hope School', 1600000, 'Bank Transfer', 'Low', 'Oct 31, 06:30 AM', face.esther),
  P(8, 'Ahmed Ibrahim', 'Unity Primary School', 1950000, 'Stripe', 'Med', 'Oct 31, 06:12 AM', face.kato),
  P(9, 'Esther Adong', 'Cornerstone Academy', 1750000, 'MoMo', 'Low', 'Oct 31, 05:48 AM', face.nakato),
  P(10, 'Samuel Tesfaye', 'Light of Hope School', 2200000, 'Bank Transfer', 'Med', 'Oct 31, 05:20 AM', face.john),
];

const TEACHERS = ['Brian Ssali', 'Joy Atuhaire', 'Moses Kiprop', 'Halima Juma', 'Patrick Obi', 'Agatha Mensah', 'Collins Otieno', 'Faith Uwase'];
const SCHOOLS = ['Green Valley Academy', 'Bright Future School', 'Sunrise Primary', 'Hope International', 'Cornerstone Academy', 'Unity Primary School'];
const METHODS: readonly PayoutRow['method'][] = ['MoMo', 'Bank Transfer', 'Stripe', 'Mobile Money'];
const PHOTOS = [face.agnes, face.aisha, face.tutorB, face.tutorC, face.tutorD, face.tutorA];

function morePayouts(): readonly PayoutRow[] {
  const out: PayoutRow[] = [];
  for (let n = 11; n <= 608; n++) {
    const amount = 600000 + ((n * 131) % 34) * 100000;
    const risk: Payout['risk'] = n % 13 === 0 ? 'High' : n % 3 === 0 ? 'Med' : 'Low';
    const h = 12 - (Math.floor(n / 50) % 12);
    out.push(P(n, TEACHERS[n % TEACHERS.length], SCHOOLS[n % SCHOOLS.length], amount, METHODS[n % METHODS.length], risk, `Oct ${30 - Math.floor(n / 25)}, ${String(h).padStart(2, '0')}:${String((n * 7) % 60).padStart(2, '0')} ${n % 2 ? 'PM' : 'AM'}`, PHOTOS[n % PHOTOS.length]));
  }
  return out;
}

export const payouts: readonly PayoutRow[] = [...firstPayouts, ...morePayouts()];

export const payoutStats: readonly KpiData[] = [
  { label: 'Total Teachers', value: '12,480', delta: '+2%', caption: 'vs. last month', icon: 'people', tone: 'blue' },
  { label: 'Approved Payouts', value: '11,872', delta: '+3%', caption: 'vs. last month', icon: 'check', tone: 'green' },
  { label: 'Total Payout Amount', value: 'UGX 1.84B', delta: '+5%', caption: 'vs. last month', icon: 'wallet', tone: 'purple' },
  { label: 'Pending Approvals', value: '608', delta: '-12%', down: true, caption: 'vs. last month', icon: 'clock', tone: 'orange' },
  { label: 'Retry Queue', value: '187', delta: '+8%', caption: 'needs attention', icon: 'sync', tone: 'green' },
  { label: 'Disputes', value: '24', delta: '+4%', caption: 'open cases', icon: 'alert', tone: 'red' },
];

export const payoutTabs = ['Approval Queue', 'Disbursement Tracking', 'Retry Queue', 'Refunds', 'Disputes', 'Reports'];
export const admins = ['Mary N.', 'James K.', 'Grace M.'];

export const summary = [
  { label: 'Total Approved', value: 'UGX 1.84B', delta: '+5%', color: Maple.blue, values: [3, 4, 3.6, 5, 4.8, 6, 6.4, 7, 8.4] },
  { label: 'Pending Approval', value: 'UGX 213M', delta: '+3%', color: Maple.warning, values: [4, 3.2, 4.4, 3.8, 5, 4.6, 5.6, 5.2, 6.2] },
  { label: "Today's Disbursals", value: 'UGX 276M', delta: '+12%', color: Maple.successText, values: [2, 3, 2.6, 3.8, 3.4, 4.6, 4.2, 5.6, 6.6] },
];

export const disbursements: readonly { when: string; amount: number; method: string; status: 'Completed' | 'Processing'; ref: string }[] = [
  { when: 'Oct 30, 2026 04:15 PM', amount: 2750000, method: 'MoMo', status: 'Completed', ref: 'PAY-20261030-001' },
  { when: 'Oct 30, 2026 02:42 PM', amount: 1850000, method: 'Bank Transfer', status: 'Completed', ref: 'PAY-20261030-002' },
  { when: 'Oct 30, 2026 01:20 PM', amount: 2100000, method: 'Stripe', status: 'Completed', ref: 'PAY-20261030-003' },
];

export const retries: readonly { id: string; amount: number; attempts: number; next: string }[] = [
  { id: 'TXN-784532', amount: 950000, attempts: 2, next: 'Oct 31, 10:00 AM' },
  { id: 'TXN-784533', amount: 1200000, attempts: 1, next: 'Oct 31, 11:30 AM' },
  { id: 'TXN-784534', amount: 750000, attempts: 1, next: 'Oct 31, 12:00 PM' },
];

export const disputes: readonly { id: string; issue: string; status: 'Open' | 'Under Review' | 'Investigating' | 'Resolved'; opened: string }[] = [
  { id: 'DS-20261031-001', issue: 'Payment not received', status: 'Open', opened: 'Oct 31, 09:10 AM' },
  { id: 'DS-20261031-002', issue: 'Wrong amount', status: 'Under Review', opened: 'Oct 31, 08:40 AM' },
  { id: 'DS-20261031-003', issue: 'Refund request', status: 'Investigating', opened: 'Oct 31, 08:15 AM' },
];
