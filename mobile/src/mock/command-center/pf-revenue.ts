/** Maple Command › Finance › Enterprise Receivables and Revenue Recognition sample data. Illustrative. */
import type { Commitment, Receivable } from '@/features/command/logic/receivables';
import type { RevenueItem } from '@/features/command/logic/recognition';

import { face, type KpiData } from './shared';

export const TODAY = '2026-10-31';

export interface ReceivableRow extends Receivable {
  plan: 'Enterprise Plus' | 'School Standard' | 'School Premium';
}

export const receivables: readonly ReceivableRow[] = [
  { id: 'CON-2026-0143', institution: 'Hope Valley Schools', plan: 'Enterprise Plus', contractValue: 420_000_000, invoiced: 140_000_000, paid: 44_000_000, oldestDue: '2026-07-20' },
  { id: 'CON-2026-0107', institution: 'Bright Future Academy', plan: 'School Standard', contractValue: 360_000_000, invoiced: 120_000_000, paid: 48_000_000, oldestDue: '2026-08-15' },
  { id: 'CON-2026-0098', institution: 'Riverside Schools Group', plan: 'Enterprise Plus', contractValue: 280_000_000, invoiced: 140_000_000, paid: 81_500_000, oldestDue: '2026-09-20' },
  { id: 'CON-2026-0120', institution: "St. Mark's College", plan: 'School Premium', contractValue: 300_000_000, invoiced: 120_000_000, paid: 74_000_000, oldestDue: '2026-07-10' },
  { id: 'CON-2026-0085', institution: 'Green Valley Education', plan: 'School Standard', contractValue: 240_000_000, invoiced: 120_000_000, paid: 80_000_000, oldestDue: '2026-09-15' },
  { id: 'CON-2026-0118', institution: 'Lakeside Learning Trust', plan: 'Enterprise Plus', contractValue: 500_000_000, invoiced: 250_000_000, paid: 216_000_000, oldestDue: '2026-10-15' },
  { id: 'CON-2026-0091', institution: 'Unity Schools Network', plan: 'School Standard', contractValue: 180_000_000, invoiced: 90_000_000, paid: 72_000_000, oldestDue: '2026-10-20' },
];

export const commitments: readonly Commitment[] = [
  { id: 'C1', receivable: 'CON-2026-0143', amount: 96_000_000, due: '2026-11-10' },
  { id: 'C2', receivable: 'CON-2026-0107', amount: 50_000_000, due: '2026-11-12' },
  { id: 'C3', receivable: 'CON-2026-0120', amount: 30_000_000, due: '2026-11-15', brokenBefore: true },
  { id: 'C4', receivable: 'CON-2026-0098', amount: 25_000_000, due: '2026-10-28' },
];

export const arStats: readonly KpiData[] = [
  { label: 'Total Receivables', value: 'UGX 1,856,400,000', icon: 'database', tone: 'blue' },
  { label: 'Current (0–30 Days)', value: 'UGX 1,124,600,000', caption: '60.6%', icon: 'check', tone: 'green', valueTone: 'green' },
  { label: '31 – 60 Days', value: 'UGX 312,000,000', caption: '16.8%', icon: 'calendar', tone: 'orange', valueTone: 'orange' },
  { label: '61 – 90 Days', value: 'UGX 210,800,000', caption: '11.4%', icon: 'calendar', tone: 'orange', valueTone: 'orange' },
  { label: 'Over 90 Days', value: 'UGX 209,000,000', caption: '11.3%', icon: 'calendar', tone: 'red', valueTone: 'red' },
  { label: 'Active Contracts', value: '142', caption: 'Value UGX 8.76B', icon: 'doc', tone: 'grey' },
];

/** Whole-platform balances by bucket; the sample contracts are the largest of them. */
export const arTotals = { total: 1_856_400_000, Current: 1_124_600_000, '31 – 60 Days': 312_000_000, '61 – 90 Days': 210_800_000, '> 90 Days': 209_000_000, contracts: 142 };

/** Receivables balance and collections, in billions, Jan–Oct 2026. */
export const arTrend = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  balance: [1.42, 1.38, 1.4, 1.55, 1.62, 1.58, 1.6, 1.64, 1.78, 1.86],
  collections: [1.22, 1.22, 1.26, 1.32, 1.4, 1.4, 1.4, 1.42, 1.56, 1.72],
};

export const arActivity: readonly { text: string; when: string }[] = [
  { text: 'Payment received: UGX 40,000,000 – Unity Schools Network', when: 'Today, 10:24 AM' },
  { text: 'Payment promise: UGX 50,000,000 – Bright Future Academy', when: 'Today, 9:17 AM' },
  { text: 'Reminder sent: UGX 96,000,000 – Hope Valley Schools', when: 'Yesterday, 4:30 PM' },
];

/* ─── Revenue recognition ─── */

export interface RecRow extends RevenueItem {
  customer: string;
  ref: string;
  type: 'Subscription' | 'Course Access' | 'Marketplace Commission' | 'Cancellation';
  avatar?: number;
}

export const recItems: readonly RecRow[] = [
  { id: 'SUB-2026-0143', customer: 'Hope Valley Schools', ref: 'SCH-00184', type: 'Subscription', total: 420_000_000, cash: 420_000_000, method: 'straight', start: '2026-05-01', periods: 12 },
  { id: 'SUB-2026-0107', customer: 'Bright Future Academy', ref: 'SCH-00126', type: 'Subscription', total: 360_000_000, cash: 360_000_000, method: 'straight', start: '2026-05-01', periods: 12 },
  { id: 'CRS-2026-0921', customer: 'John K. (Learner)', ref: 'LRN-045889', type: 'Course Access', total: 75_000, cash: 75_000, method: 'access', start: '2026-09-26', periods: 8, avatar: face.john },
  { id: 'MKT-2026-0048', customer: 'Tutor: Mary T.', ref: 'TUT-00873', type: 'Marketplace Commission', total: 1_200_000, cash: 1_200_000, method: 'delivery', start: '2026-10-12', periods: 1, delivered: true, avatar: face.nakato },
  { id: 'SUB-2026-0198', customer: 'Riverside Schools Group', ref: 'SCH-00876', type: 'Subscription', total: 280_000_000, cash: 280_000_000, method: 'straight', start: '2026-08-01', periods: 12 },
  { id: 'SUB-2026-0175', customer: 'Green Valley Education', ref: 'SCH-00835', type: 'Subscription', total: 180_000_000, cash: 180_000_000, method: 'straight', start: '2025-11-01', periods: 12 },
  { id: 'CAN-2026-0066', customer: 'Lakeside Learning Trust', ref: 'SCH-00641', type: 'Cancellation', total: 100_000_000, cash: 100_000_000, method: 'straight', start: '2026-07-01', periods: 10, cancelled: '2026-10-31' },
];

export const recStats: readonly KpiData[] = [
  { label: 'Cash Received (YTD)', value: 'UGX 5,918,700,000', delta: '14.8%', icon: 'wallet', tone: 'blue' },
  { label: 'Revenue Earned (YTD)', value: 'UGX 4,386,750,000', delta: '12.1%', icon: 'layers', tone: 'green' },
  { label: 'Deferred Revenue (Unearned)', value: 'UGX 1,475,650,000', icon: 'clock', tone: 'orange', valueTone: 'orange' },
  { label: 'Recognition This Month', value: 'UGX 482,600,000', icon: 'chart', tone: 'purple' },
  { label: 'Adjustments & Refunds', value: 'UGX 56,300,000', icon: 'ticket', tone: 'red', valueTone: 'red' },
];

/** Year-to-date platform figures; the sample items are part of them. Cash = earned + deferred + adjustments. */
export const recTotals = { cash: 5_918_700_000, earned: 4_386_750_000, deferred: 1_475_650_000, month: 482_600_000, adjustments: 56_300_000, records: 2864 };

export const position = { opening: 1_320_400_000, prepayments: 2_186_000_000, recognized: 1_982_750_000, cancellations: 48_000_000 };

/** Cash received and revenue earned (millions) with the deferred line, Jan–Oct 2026. */
export const recTrend = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  cash: [300, 250, 310, 290, 330, 360, 400, 420, 500, 560],
  earned: [240, 220, 260, 250, 280, 300, 330, 340, 450, 480],
  deferred: [60, 70, 80, 85, 90, 100, 105, 110, 115, 120],
};

export const upcoming: readonly { date: string; amount: number }[] = [
  { date: 'Nov 1, 2026', amount: 482_600_000 },
  { date: 'Dec 1, 2026', amount: 476_200_000 },
  { date: 'Jan 1, 2027', amount: 469_800_000 },
];

export const policy: readonly { bold: string; text: string }[] = [
  { bold: 'Subscriptions:', text: ' Straight-line over contract period' },
  { bold: 'Course Access:', text: ' Over course duration / access period' },
  { bold: 'Marketplace Commissions:', text: ' At service delivery (completion)' },
  { bold: 'Discounts:', text: ' Reduce recognized revenue proportionally' },
  { bold: 'Cancellations & Refunds:', text: ' Reverse unearned revenue' },
];
