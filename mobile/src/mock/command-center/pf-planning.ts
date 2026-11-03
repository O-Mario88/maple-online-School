/** Maple Command › Finance › Forecasting and Financial Reports sample data. Illustrative. */
import type { Line } from '@/features/command/logic/forecast';

const M = 1_000_000;
const m = (xs: readonly number[]) => xs.map((x) => x * M);
/** Plan revenue is set from the current run-rate (about 950M a month in 2026). */
const RUN_RATE = 1.35;
const r = (xs: readonly number[]) => xs.map((x) => Math.round(x * RUN_RATE) * M);

/** Nov 2026 – Oct 2027 (FY2027 plan). */
export const months = ['Nov 2026', 'Dec 2026', 'Jan 2027', 'Feb 2027', 'Mar 2027', 'Apr 2027', 'May 2027', 'Jun 2027', 'Jul 2027', 'Aug 2027', 'Sep 2027', 'Oct 2027'] as const;

export const plan: readonly Line[] = [
  { name: 'Subscriptions (Schools & Learners)', kind: 'revenue', values: r([420, 445, 470, 510, 540, 560, 590, 620, 660, 710, 740, 780]) },
  { name: 'Course Fees (MOOC & Live)', kind: 'revenue', values: r([160, 170, 180, 190, 200, 215, 230, 240, 250, 265, 280, 300]) },
  { name: 'Marketplace Commissions', kind: 'revenue', values: r([60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 115, 120]) },
  { name: 'Other Income (certificates, exams)', kind: 'revenue', values: r([40, 42, 45, 48, 50, 52, 55, 57, 60, 62, 64, 70]) },
  { name: 'Teacher Payouts (Independent)', kind: 'variable', values: m([180, 192, 198, 205, 210, 215, 225, 230, 248, 255, 265, 272]) },
  { name: 'Cloud, LiveKit & AI', kind: 'variable', values: m([82, 85, 88, 92, 96, 100, 105, 108, 112, 118, 122, 126]) },
  { name: 'Salaries & Benefits (Corporate)', kind: 'fixed', values: m([384, 386, 388, 390, 392, 394, 396, 398, 400, 402, 404, 406]) },
  { name: 'Marketing & Growth', kind: 'fixed', values: m([60, 70, 75, 80, 85, 90, 95, 100, 110, 115, 120, 125]) },
  { name: 'Other Operating & Admin', kind: 'fixed', values: m([90, 92, 95, 98, 100, 102, 104, 106, 108, 110, 112, 114]) },
];

/** Opening cash is the reconciled Stanbic balance from the corporate ledger. */
export const treasury = {
  opening: 5_920_400_000,
  openingLabel: 'Opening Cash (Nov 1, 2026)',
  collectedInMonth: 0.8,
  lastRevenue: 480 * M,
  capex: m([0, 0, 120, 0, 0, 150, 0, 0, 120, 0, 0, 150]),
  /** Stanbic term loan, repaid over the year. */
  financing: m([175, 175, 175, 175, 175, 175, 175, 175, 175, 175, 175, 175]),
  runwayTarget: 12,
  reserveMonths: 3,
  liquidityTarget: 1.5,
  /** FY2026 annualised from the ten months to October (×12/10), for the growth comparison. */
  lastYear: { revenue: 11_376_000_000, expenses: 8_078_880_000 },
};

/* ─── Reports ─── */

/** Jan – Oct 2025 comparatives by ledger account. */
export const priorYear: Readonly<Record<string, number>> = {
  '4000': 5_960_000_000,
  '4100': 980_000_000,
  '4200': 520_000_000,
  '4900': 64_000_000,
  '5100': 2_460_000_000,
  '5200': 180_000_000,
  '6000': 2_310_000_000,
  '6200': 560_000_000,
  '6210': 150_000_000,
  '6300': 120_000_000,
  '6500': 85_000_000,
  '6700': 60_000_000,
  '6800': 11_000_000,
};

/** Cash-flow classification for the year to date; the net change ties to the ledger's bank balance. */
export const cashFlowYtd = { operating: 3_420_000_000, investing: -1_240_000_000, financing: -320_000_000 };

export const period = 'Jan 1 – Oct 31, 2026 (YTD)';
export const periods = ['Jan 1 – Oct 31, 2026 (YTD)', 'Oct 1 – Oct 31, 2026', 'Q3 2026 (Jul – Sep)'] as const;

export const statementsList: readonly { kind: 'Profit & Loss' | 'Balance Sheet' | 'Cash Flow' | 'Changes in Equity' | 'General Ledger'; label: string; note: string; icon: 'chart' | 'building' | 'sync' | 'shield' | 'doc' }[] = [
  { kind: 'Profit & Loss', label: 'Profit and Loss (P&L)', note: 'Revenue, expenses and net profit', icon: 'chart' },
  { kind: 'Balance Sheet', label: 'Balance Sheet', note: 'Assets, liabilities and equity', icon: 'building' },
  { kind: 'Cash Flow', label: 'Cash Flow Statement', note: 'Operating, investing and financing cash flows', icon: 'sync' },
  { kind: 'Changes in Equity', label: 'Changes in Equity', note: 'Share capital, reserves and retained earnings', icon: 'shield' },
  { kind: 'General Ledger', label: 'General Ledger', note: 'All posted transactions by account', icon: 'doc' },
];

export const managementReports: readonly { label: string; route: string; icon: 'chart' | 'wallet' | 'people' | 'sync' | 'building' | 'clock' | 'grid' }[] = [
  { label: 'Revenue by Product & Channel', route: '/command/finance/profitability', icon: 'chart' },
  { label: 'Expenses by Category & Cost Centre', route: '/command/finance/expenses', icon: 'wallet' },
  { label: 'Teacher Payouts Summary', route: '/command/finance/teacher-payables', icon: 'people' },
  { label: 'Subscription & Churn Report', route: '/command/finance/subscriptions', icon: 'sync' },
  { label: 'Institution Performance (Schools)', route: '/command/finance/receivables', icon: 'building' },
  { label: 'Liquidity & Cash Runway', route: '/command/finance/forecast', icon: 'clock' },
  { label: 'KPI Financial Dashboard', route: '/command/overview', icon: 'grid' },
];

/** Revenue, expenses and net profit (millions), Jan – Oct 2026, from the ledger's monthly postings. */
export const reportTrend = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  revenue: [820, 850, 880, 900, 930, 950, 970, 990, 910, 480],
  expenses: [560, 590, 600, 620, 640, 660, 680, 700, 590, 492],
};
