/**
 * Maple Command › Finance › Unit Economics & Profitability and Financial Integrations sample data.
 * Illustrative. Profitability totals come from the corporate ledger; this file holds only how they
 * split across regions, curricula, plans and channels.
 */
import type { SegmentWeights } from '@/features/command/logic/profitability';

/* ─── Profitability ─── */

export const learners = { paying: 221_000, newYtd: 64_000, monthlyChurn: 0.032, months: 10 };

export const dimensions: Readonly<Record<'By Region' | 'By Curriculum' | 'By Subscription Plan' | 'By Channel', readonly SegmentWeights[]>> = {
  'By Region': [
    { name: 'Uganda', revenue: 34.2, direct: 36, learners: 38 },
    { name: 'Kenya', revenue: 21.9, direct: 22.5, learners: 20 },
    { name: 'Rest of Africa', revenue: 17.1, direct: 18, learners: 19 },
    { name: 'Global (Other)', revenue: 26.8, direct: 23.5, learners: 23 },
  ],
  'By Curriculum': [
    { name: 'UNEB (Uganda)', revenue: 38.4, direct: 36, learners: 40 },
    { name: 'KCSE (Kenya)', revenue: 18.7, direct: 19, learners: 18 },
    { name: 'IGCSE', revenue: 16.5, direct: 16, learners: 14 },
    { name: 'IB', revenue: 9.4, direct: 9, learners: 6 },
    { name: 'WAEC', revenue: 8.6, direct: 10, learners: 12 },
    { name: 'Other', revenue: 8.4, direct: 10, learners: 10 },
  ],
  'By Subscription Plan': [
    { name: 'Basic (Self-Learn)', revenue: 22.4, direct: 24, learners: 40 },
    { name: 'Standard (Classes + Support)', revenue: 34.6, direct: 34, learners: 35.4 },
    { name: 'Premium (Live + AI + Assess.)', revenue: 27.9, direct: 26, learners: 19.3 },
    { name: 'Institution / School Plan', revenue: 15.1, direct: 16, learners: 5.3 },
  ],
  'By Channel': [
    { name: 'Direct (Web & App)', revenue: 46, direct: 44, learners: 50 },
    { name: 'School Partnerships', revenue: 30, direct: 31, learners: 28 },
    { name: 'Marketplace Tutors', revenue: 16, direct: 18, learners: 14 },
    { name: 'Mobile Money Agents', revenue: 8, direct: 7, learners: 8 },
  ],
};

/** How the ledger's delivery accounts split into the cost lines finance tracks. */
export const costSplit: readonly { account: string; parts: readonly { name: string; amount: number; icon: 'cloud' | 'video' | 'sparkle' | 'wallet' | 'people' | 'database' | 'settings' }[] }[] = [
  { account: '6200', parts: [{ name: 'Cloud & Infrastructure', amount: 290_000_000, icon: 'cloud' }, { name: 'LiveKit (Live Classes)', amount: 196_400_000, icon: 'video' }, { name: 'Storage & CDN', amount: 120_000_000, icon: 'database' }] },
  { account: '6210', parts: [{ name: 'AI Usage (LLM, Grading)', amount: 140_000_000, icon: 'sparkle' }, { name: 'Other Direct Tools', amount: 40_000_000, icon: 'settings' }] },
  { account: '5200', parts: [{ name: 'Payment & Transaction Fees', amount: 210_000_000, icon: 'wallet' }] },
  { account: '5100', parts: [{ name: 'Teacher Payouts', amount: 2_980_000_000, icon: 'people' }] },
];

export const courses: readonly { name: string; learners: number; revenue: number; directRatio: number }[] = [
  { name: 'Mathematics (UNEB)', learners: 36_500, revenue: 1_036_000_000, directRatio: 0.36 },
  { name: 'English (UNEB)', learners: 32_400, revenue: 882_000_000, directRatio: 0.38 },
  { name: 'Sciences (IGCSE)', learners: 18_900, revenue: 572_000_000, directRatio: 0.4 },
  { name: 'Business Studies (KCSE)', learners: 14_800, revenue: 424_000_000, directRatio: 0.42 },
  { name: 'ICT (IB)', learners: 9_600, revenue: 356_000_000, directRatio: 0.43 },
];

/** Revenue, direct costs and operating profit (millions), Jan – Oct 2026. */
export const profitTrend = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  revenue: [815, 845, 875, 895, 925, 945, 965, 985, 905, 475],
  direct: [345, 355, 370, 375, 390, 395, 405, 415, 380, 346],
};

/* ─── Integrations ─── */

export type IntegrationType = 'Bank Feed' | 'Payment Gateway' | 'Accounting Export' | 'Webhook';

export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  badge: string;
  color: string;
  status: 'Connected' | 'Paused' | 'Error';
  lastSync: string;
  today: number;
  secret: string;
  lastRotated: string;
}

export const integrations: readonly Integration[] = [
  { id: 'INT-01', name: 'Stanbic Bank (UG)', type: 'Bank Feed', badge: 'SB', color: '#0033A0', status: 'Connected', lastSync: 'Oct 31, 2026, 10:42 AM', today: 3_420, secret: 'sbg_demo_8h2KqP0wLm4ZtYv7Rr2201', lastRotated: '2026-09-12' },
  { id: 'INT-02', name: 'MTN MoMo', type: 'Payment Gateway', badge: 'MTN', color: '#FFCB05', status: 'Connected', lastSync: 'Oct 31, 2026, 10:40 AM', today: 14_860, secret: 'mtn_demo_Q8yTb3NnVz6LkPp1Ww7784', lastRotated: '2026-06-28' },
  { id: 'INT-03', name: 'Airtel Money', type: 'Payment Gateway', badge: 'AT', color: '#E40000', status: 'Connected', lastSync: 'Oct 31, 2026, 10:38 AM', today: 9_204, secret: 'atl_demo_Xr5Mc8Ga2Hn0Js9Kd4410', lastRotated: '2026-08-30' },
  { id: 'INT-04', name: 'M-Pesa', type: 'Payment Gateway', badge: 'MP', color: '#3BAA35', status: 'Connected', lastSync: 'Oct 31, 2026, 10:37 AM', today: 6_112, secret: 'mps_demo_Pq2Zr6Tb9Vc1Wn4Yx3091', lastRotated: '2026-10-02' },
  { id: 'INT-05', name: 'Stripe (Cards)', type: 'Payment Gateway', badge: 'S', color: '#635BFF', status: 'Connected', lastSync: 'Oct 31, 2026, 10:39 AM', today: 2_418, secret: 'sk_demo_51HxQpL2eZvKYlo2C5520', lastRotated: '2026-09-20' },
  { id: 'INT-06', name: 'QuickBooks Online', type: 'Accounting Export', badge: 'qb', color: '#2CA01C', status: 'Connected', lastSync: 'Oct 31, 2026, 10:30 AM', today: 0, secret: 'qbo_demo_Lm3Nb7Vc2Xz8Kj5Hg1188', lastRotated: '2026-07-15' },
];

export const intStats = { syncedYtd: 2_486_320, banks: 4, gateways: 5, exports: 3, webhooks: 12, exceptions: 18 };

export const imports = { ok: 34_962, warnings: 698, failed: 354 };

export const webhooks: readonly { name: string; healthy: boolean; ms: number; success: number }[] = [
  { name: 'payment.succeeded', healthy: true, ms: 212, success: 0.9999 },
  { name: 'payment.failed', healthy: true, ms: 240, success: 0.9998 },
  { name: 'refund.created', healthy: true, ms: 268, success: 0.9999 },
  { name: 'payout.paid', healthy: true, ms: 301, success: 0.9997 },
  { name: 'subscription.renewed', healthy: true, ms: 255, success: 0.9999 },
  { name: 'subscription.cancelled', healthy: true, ms: 290, success: 0.9996 },
  { name: 'invoice.paid', healthy: true, ms: 277, success: 0.9998 },
  { name: 'bank.statement.ready', healthy: true, ms: 344, success: 0.9995 },
  { name: 'momo.collection', healthy: true, ms: 318, success: 0.9997 },
  { name: 'airtel.collection', healthy: true, ms: 309, success: 0.9996 },
  { name: 'mpesa.c2b', healthy: true, ms: 296, success: 0.9998 },
  { name: 'qbo.export.done', healthy: true, ms: 298, success: 0.9999 },
];

export interface IntException {
  id: string;
  at: string;
  source: string;
  issue: string;
  status: 'Open' | 'In Progress' | 'Retrying' | 'Resolved';
  attempts: number;
  log: readonly string[];
}

export const exceptions: readonly IntException[] = [
  { id: 'EX-018', at: 'Oct 31, 2026, 09:52 AM', source: 'MTN MoMo', issue: 'Duplicate transaction (Ref: MM-784532)', status: 'Open', attempts: 1, log: [] },
  { id: 'EX-017', at: 'Oct 31, 2026, 09:41 AM', source: 'Stanbic Bank', issue: 'Unmatched amount (UGX 420,000)', status: 'Open', attempts: 1, log: [] },
  { id: 'EX-016', at: 'Oct 31, 2026, 09:18 AM', source: 'Airtel Money', issue: 'Missing reference ID', status: 'In Progress', attempts: 2, log: ['09:30 Grace Nankya started review'] },
  { id: 'EX-015', at: 'Oct 31, 2026, 08:57 AM', source: 'Stripe', issue: 'Currency conversion mismatch', status: 'Open', attempts: 1, log: [] },
  { id: 'EX-014', at: 'Oct 31, 2026, 08:34 AM', source: 'QuickBooks', issue: 'Export failed (API timeout)', status: 'Open', attempts: 3, log: [] },
];

export const syncLog: readonly { at: string; integration: string; activity: string; records: number | null }[] = [
  { at: 'Oct 31, 2026, 10:42 AM', integration: 'Stanbic Bank (UG)', activity: 'Bank transactions imported', records: 3_420 },
  { at: 'Oct 31, 2026, 10:40 AM', integration: 'MTN MoMo', activity: 'Payment transactions imported', records: 14_860 },
  { at: 'Oct 31, 2026, 10:38 AM', integration: 'Airtel Money', activity: 'Payment transactions imported', records: 9_204 },
  { at: 'Oct 31, 2026, 10:37 AM', integration: 'M-Pesa', activity: 'Payment transactions imported', records: 6_112 },
  { at: 'Oct 31, 2026, 10:30 AM', integration: 'QuickBooks Online', activity: 'GL export (daily) completed', records: null },
];
