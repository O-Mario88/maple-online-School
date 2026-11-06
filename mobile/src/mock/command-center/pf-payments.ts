/** Maple Command › Finance › Payment Transactions and Settlement Reconciliation sample data. Illustrative. */
import type { Batch, Txn } from '@/features/command/logic/payments';

import { face, type KpiData } from './shared';
import { Maple } from '@/constants/maple';

export interface TxnRow extends Txn {
  ref: string;
  kind: 'Institution' | 'Learner' | 'Parent';
  avatar?: number;
  settlement: 'Settled' | '—';
  currency: 'UGX';
}

const T = (id: string, at: string, customer: string, ref: string, kind: TxnRow['kind'], type: string, provider: string, amount: number, status: Txn['status'], avatar?: number): TxnRow => ({
  id,
  at,
  customer,
  ref,
  kind,
  type,
  provider,
  amount,
  status,
  refunded: status === 'Refunded' ? amount : 0,
  avatar,
  settlement: status === 'Successful' || status === 'Refunded' || status === 'Chargeback' ? 'Settled' : '—',
  currency: 'UGX',
});

export const txns: readonly TxnRow[] = [
  T('TRX-9F72D3A1', 'Oct 31, 2026, 09:14 AM', 'Green Valley School', 'SCH-00184', 'Institution', 'Subscription', 'Stripe', 1_200_000, 'Successful'),
  T('TRX-7A61B9E2', 'Oct 31, 2026, 08:47 AM', 'Amina N.', 'LRN-045772', 'Learner', 'Learner Plan', 'Paystack', 50_000, 'Successful', face.sarah),
  T('TRX-5C90E7B4', 'Oct 30, 2026, 06:32 PM', 'Daniel K.', 'LRN-045889', 'Learner', 'Subject Purchase', 'Flutterwave', 75_000, 'Successful', face.john),
  T('TRX-3D27A6F9', 'Oct 30, 2026, 02:18 PM', 'Riverside Academy', 'SCH-00126', 'Institution', 'Subscription', 'Pesapal', 600_000, 'Successful'),
  T('TRX-91B4C2D0', 'Oct 30, 2026, 11:05 AM', 'Parent – Grace A.', 'PRN-008731', 'Parent', 'School Fee', 'Mobile Money', 450_000, 'Successful', face.esther),
  T('TRX-6E44F1A9', 'Oct 29, 2026, 08:21 PM', 'Hope Primary School', 'SCH-00211', 'Institution', 'Subscription', 'Bank Transfer', 2_500_000, 'Pending'),
  T('TRX-4B77E9C3', 'Oct 29, 2026, 03:40 PM', 'John O.', 'LRN-045993', 'Learner', 'Subject Purchase', 'Airtel Money', 30_000, 'Failed', face.okello),
  T('TRX-2A30D8F7', 'Oct 28, 2026, 10:19 AM', 'Bright Future School', 'SCH-00267', 'Institution', 'Subscription', 'Flutterwave', 1_000_000, 'Refunded'),
  T('TRX-8D11C6B2', 'Oct 27, 2026, 04:56 PM', 'Mary T.', 'LRN-045661', 'Learner', 'Learner Plan', 'Paystack', 50_000, 'Chargeback', face.nakato),
  T('TRX-7F33A9E1', 'Oct 27, 2026, 09:08 AM', "St. Mark's College", 'SCH-00155', 'Institution', 'Subscription', 'Stripe', 3_000_000, 'Successful'),
];

/** Provider badge colours (a plain letter badge, not the providers' marks). */
export const providerColor: Readonly<Record<string, string>> = {
  Stripe: Maple.blue,
  Paystack: '#0BA4DB',
  Flutterwave: Maple.warning,
  Pesapal: Maple.blue,
  'Mobile Money': Maple.warning,
  'MTN MoMo': Maple.warning,
  'Airtel Money': Maple.error,
  'Bank Transfer': Maple.secondary,
  Others: Maple.faint,
};

export const txnStats: readonly KpiData[] = [
  { label: 'Total Transaction Value', value: 'UGX 4,862,750,000', delta: '12.4%', caption: 'vs. previous 30 days', icon: 'wallet', tone: 'blue' },
  { label: 'Successful Payments', value: '4,723', caption: '97.1%', icon: 'check', tone: 'green', valueTone: 'green' },
  { label: 'Pending', value: '86', caption: '1.8%', icon: 'clock', tone: 'orange', valueTone: 'orange' },
  { label: 'Failed', value: '42', caption: '0.9%', icon: 'close', tone: 'red', valueTone: 'red' },
  { label: 'Refunded', value: '27', caption: 'UGX 18,750,000', icon: 'undo', tone: 'red' },
  { label: 'Chargebacks', value: '6', caption: 'UGX 4,200,000', icon: 'sync', tone: 'purple' },
];

/** Platform totals the sample rows are the newest part of. */
export const txnTotals = { value: 4_862_750_000, count: 4878, successful: 4723, pending: 86, failed: 42, refunded: 27, refundedValue: 18_750_000, chargebacks: 6, chargebackValue: 4_200_000 };

/** Daily value (millions) and count, Oct 1–31. */
export const volume = {
  labels: ['Oct 1', '', 'Oct 5', '', 'Oct 9', '', 'Oct 13', 'Oct 17', 'Oct 21', 'Oct 25', '', 'Oct 31'],
  value: [130, 170, 230, 210, 280, 300, 320, 290, 380, 360, 420, 400],
  count: [430, 520, 610, 560, 690, 720, 760, 700, 820, 790, 860, 840],
};

export const byProvider: readonly { label: string; value: number }[] = [
  { label: 'Stripe', value: 1_720_000_000 },
  { label: 'Flutterwave', value: 1_008_500_000 },
  { label: 'Paystack', value: 612_750_000 },
  { label: 'Mobile Money', value: 578_000_000 },
  { label: 'Pesapal', value: 350_000_000 },
  { label: 'Bank Transfer', value: 320_000_000 },
  { label: 'Others', value: 273_500_000 },
];

export interface BatchRow extends Batch {
  period: string;
  transactions: number;
}

const B = (id: string, provider: string, period: string, transactions: number, gross: number, fees: number, refunds: number, deposit: number | null): BatchRow => ({ id, provider, period, transactions, gross, fees, refunds, deposit });

export const batches: readonly BatchRow[] = [
  B('ST-20261031-001', 'Stripe', 'Oct 25 – Oct 31', 1247, 1_200_000_000, 23_400_000, 4_500_000, 1_172_100_000),
  B('FW-20261030-014', 'Flutterwave', 'Oct 24 – Oct 30', 898, 600_000_000, 10_800_000, 1_200_000, 588_000_000),
  B('PS-20261028-007', 'Paystack', 'Oct 22 – Oct 28', 621, 420_000_000, 7_560_000, 2_400_000, 410_040_000),
  B('MM-20261027-009', 'MTN MoMo', 'Oct 21 – Oct 27', 1033, 370_000_000, 5_920_000, 3_000_000, 356_480_000),
  B('AM-20261026-005', 'Airtel Money', 'Oct 20 – Oct 26', 512, 280_000_000, 4_480_000, 1_250_000, 274_270_000),
  B('PSP-20261025-002', 'Pesapal', 'Oct 19 – Oct 25', 318, 160_000_000, 2_560_000, 800_000, 156_640_000),
  B('BNK-20261024-001', 'Bank Transfer', 'Oct 18 – Oct 24', 76, 90_000_000, 0, 0, 86_400_000),
  B('ST-20261017-003', 'Stripe', 'Oct 11 – Oct 17', 1082, 980_000_000, 19_600_000, 6_200_000, 954_200_000),
  B('FW-20261010-006', 'Flutterwave', 'Oct 4 – Oct 10', 643, 360_000_000, 6_480_000, 2_000_000, 351_520_000),
  B('PS-20261003-004', 'Paystack', 'Oct 1 – Oct 3', 308, 140_000_000, 2_520_000, 640_000, 136_840_000),
  B('AM-20261031-006', 'Airtel Money', 'Oct 28 – Oct 31', 41, 9_450_000, 150_000, 50_000, null),
];

export const settlementStats: readonly KpiData[] = [
  { label: 'Expected Settlements', value: 'UGX 4,862,750,000', icon: 'layers', tone: 'green' },
  { label: 'Bank Deposits (Actual)', value: 'UGX 4,844,300,000', caption: '99.6% of expected', icon: 'building', tone: 'blue', valueTone: 'green' },
  { label: 'Reconciled', value: 'UGX 4,826,800,000', caption: '99.3%', icon: 'check', tone: 'green', valueTone: 'green' },
  { label: 'Unreconciled Differences', value: 'UGX 18,450,000', icon: 'alert', tone: 'orange', valueTone: 'red' },
  { label: 'Provider Fees & Deductions', value: 'UGX 94,120,000', icon: 'database', tone: 'purple' },
  { label: 'Refunds & Chargebacks', value: 'UGX 27,950,000', icon: 'sync', tone: 'red', valueTone: 'red' },
];

/** The month's totals; the sample batches are its newest part. */
export const settlementTotals = { expected: 4_862_750_000, deposits: 4_844_300_000, reconciled: 4_826_800_000, unreconciled: 18_450_000, batches: 24, exceptions: 18, autoMatched: 4723, matchedPct: 97.1 };

/** Expected and deposited value (millions) and the reconciled line, every three days in October. */
export const flow = {
  labels: ['Oct 1', 'Oct 4', 'Oct 7', 'Oct 10', 'Oct 13', 'Oct 16', 'Oct 19', 'Oct 22', 'Oct 25', 'Oct 28', 'Oct 31'],
  expected: [170, 230, 250, 340, 380, 390, 430, 410, 450, 420, 480],
  deposit: [165, 225, 246, 336, 372, 386, 424, 404, 446, 414, 470],
  reconciled: [200, 240, 270, 350, 360, 380, 420, 410, 440, 430, 500],
};

export const reconParts: readonly { label: string; value: number; color: string }[] = [
  { label: 'Reconciled', value: 4_826_800_000, color: Maple.successText },
  { label: 'Pending Match', value: 9_250_000, color: Maple.warning },
  { label: 'Mismatch / Difference', value: 5_600_000, color: Maple.error },
  { label: 'Under Investigation', value: 3_600_000, color: Maple.blue },
];

export const topDifferences: readonly { label: string; amount: number; icon: 'building' | 'undo' | 'help' }[] = [
  { label: 'Bank Deposit Shortage', amount: -4_600_000, icon: 'building' },
  { label: 'Bank Deposit Shortage', amount: -3_600_000, icon: 'building' },
  { label: 'Unmatched Refund', amount: -2_250_000, icon: 'undo' },
  { label: 'Unknown Deduction', amount: -1_200_000, icon: 'help' },
];

export const breakdown: readonly { label: string; pct: number; color: string }[] = [
  { label: 'Stripe', pct: 24.1, color: Maple.blue },
  { label: 'Flutterwave', pct: 12.3, color: Maple.warning },
  { label: 'Paystack', pct: 8.6, color: Maple.blue },
  { label: 'MTN MoMo', pct: 7.4, color: Maple.warning },
  { label: 'Airtel Money', pct: 5.8, color: Maple.error },
  { label: 'Pesapal', pct: 3.2, color: '#0BA4DB' },
  { label: 'Bank Transfer', pct: 32.5, color: Maple.secondary },
  { label: 'Others', pct: 6.1, color: Maple.successText },
];

export const providerCounts: readonly { label: string; count: number }[] = [
  { label: 'Stripe', count: 6 },
  { label: 'Flutterwave', count: 4 },
  { label: 'Paystack', count: 4 },
  { label: 'MTN MoMo', count: 3 },
  { label: 'Airtel Money', count: 2 },
  { label: 'Pesapal', count: 2 },
];

/** Bank accounts that settlement statements are uploaded from. */
export const bankAccounts: readonly string[] = ['Stanbic – Main (UGX)', 'Centenary – Collections (UGX)', 'Equity – USD'];
