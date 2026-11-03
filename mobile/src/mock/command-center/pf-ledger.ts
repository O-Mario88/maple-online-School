/**
 * Maple Command › Finance › Corporate General Ledger sample data. Illustrative. Every figure on the
 * page is computed from these entries; the closing balances match the other Platform Finance pages
 * (bank 5,918.4M, receivables 1,856.4M, AP 324.6M, teacher payables 529.2M, deferred 1,475.65M).
 */
import type { BankItem, Period } from '@/features/command/logic/ledger';
import type { Account, Entry } from '@/features/school/accounting/books';

export const TODAY = '2026-10-31';
export const LEDGER = 'MAPLE-CORP';

export interface LedgerEntry extends Entry {
  source: 'Opening' | 'Subscriptions' | 'Payables' | 'Expenses' | 'Payroll' | 'Auto' | 'Manual' | 'Bank';
  /** Where the source document lives, for drill-down. */
  route?: string;
}

const a = (code: string, name: string, type: Account['type'], sub: string): Account => ({ code, name, type, sub, status: 'Active' });

export const accounts: readonly Account[] = [
  a('1100', 'Bank – Stanbic (UGX)', 'Asset', 'Cash & Bank'),
  a('1150', 'Payment Provider Clearing', 'Asset', 'Cash & Bank'),
  a('1200', 'Accounts Receivable', 'Asset', 'Receivables'),
  a('1300', 'Platform Assets', 'Asset', 'Fixed Assets'),
  a('1310', 'Accum. Depreciation', 'Asset', 'Fixed Assets'),
  a('1400', 'Prepaid Expenses', 'Asset', 'Current Assets'),
  a('2100', 'Accounts Payable', 'Liability', 'Payables'),
  a('2200', 'PAYE & WHT Payable (URA)', 'Liability', 'Statutory'),
  a('2210', 'NSSF Payable', 'Liability', 'Statutory'),
  a('2230', 'Staff Benefits Payable', 'Liability', 'Payroll'),
  a('2300', 'Teacher Payables', 'Liability', 'Payables'),
  a('2400', 'Deferred Revenue', 'Liability', 'Deferred'),
  a('2500', 'Term Loan (Stanbic)', 'Liability', 'Long-term'),
  a('3000', 'Share Capital', 'Equity', 'Capital'),
  a('3100', 'Retained Earnings', 'Equity', 'Reserves'),
  a('4000', 'Subscription Revenue', 'Income', 'Revenue'),
  a('4100', 'Marketplace Commission', 'Income', 'Revenue'),
  a('4200', 'Course Sales', 'Income', 'Revenue'),
  a('4900', 'Other Income (Interest)', 'Income', 'Other Income'),
  a('5100', 'Teacher Earnings', 'Expense', 'Cost of Sales'),
  a('5200', 'Payment Provider Fees', 'Expense', 'Cost of Sales'),
  a('6000', 'Salaries & Benefits', 'Expense', 'Operating'),
  a('6200', 'Cloud & Infrastructure', 'Expense', 'Operating'),
  a('6210', 'Software & AI Tools', 'Expense', 'Operating'),
  a('6300', 'Marketing & Growth', 'Expense', 'Operating'),
  a('6500', 'Admin & Operations', 'Expense', 'Operating'),
  a('6700', 'Depreciation', 'Expense', 'Operating'),
  a('6800', 'Bank Charges', 'Expense', 'Operating'),
];

/** The chart's top-level groups, as on the reference. */
export const groups: readonly { code: string; name: string; type: string; tone: 'green' | 'red' | 'blue' | 'purple' | 'orange' | 'grey' }[] = [
  { code: '1000', name: 'Assets', type: 'Asset', tone: 'green' },
  { code: '2000', name: 'Liabilities', type: 'Liability', tone: 'red' },
  { code: '3000', name: 'Equity', type: 'Equity', tone: 'blue' },
  { code: '4000', name: 'Revenue', type: 'Revenue', tone: 'purple' },
  { code: '5000', name: 'Cost of Sales', type: 'Expense', tone: 'orange' },
  { code: '6000', name: 'Operating Expenses', type: 'Expense', tone: 'orange' },
];

const M = 1_000_000;
const dr = (account: string, amount: number) => ({ account, debit: Math.round(amount * M), credit: 0 });
const cr = (account: string, amount: number) => ({ account, debit: 0, credit: Math.round(amount * M) });

export const entries: readonly LedgerEntry[] = [
  {
    id: 'JRN-010001',
    date: '2026-09-30',
    description: 'Balances brought forward (Jan – Sep 2026)',
    source: 'Opening',
    status: 'Posted',
    createdBy: 'System',
    postedBy: 'System',
    lines: [
      dr('1100', 5_898.28), dr('1150', 688.8), dr('1200', 1_856.4), dr('1300', 6_000), dr('1400', 468.8), cr('1310', 48),
      cr('2100', 238.2), cr('2300', 739.2), cr('2400', 1_475.65), cr('2500', 2_101.95),
      cr('3000', 5_000), cr('3100', 2_550),
      cr('4000', 7_200), cr('4100', 1_150), cr('4200', 600), cr('4900', 50),
      dr('5100', 2_980), dr('5200', 210), dr('6000', 2_050), dr('6200', 520), dr('6210', 180), dr('6300', 150), dr('6500', 90), dr('6700', 48), dr('6800', 12.72),
    ],
  },
  { id: 'JRN-010244', date: '2026-10-22', description: 'Depreciation – Platform Assets', source: 'Auto', status: 'Posted', createdBy: 'System', postedBy: 'System', lines: [dr('6700', 24), cr('1310', 24)] },
  { id: 'JRN-010245', date: '2026-10-24', description: 'Staff payroll – Oct 2026', source: 'Payroll', route: '/command/finance/payroll', status: 'Posted', createdBy: 'Grace Nankya', postedBy: 'Denis Okello', lines: [dr('6000', 381.28), cr('1100', 249.88), cr('2200', 63.32), cr('2210', 44.4), cr('2230', 23.68)] },
  { id: 'JRN-010246', date: '2026-10-26', description: 'AWS cloud hosting – Oct 2026', source: 'Expenses', route: '/command/finance/expenses', status: 'Posted', createdBy: 'Grace Nankya', postedBy: 'Denis Okello', lines: [dr('6200', 86.4), cr('2100', 86.4)] },
  { id: 'JRN-010247', date: '2026-10-28', description: 'Teacher payout – Batch #TPB-041', source: 'Payables', route: '/command/finance/teacher-payables', status: 'Posted', createdBy: 'System', postedBy: 'Denis Okello', lines: [dr('2300', 210), cr('1100', 210)] },
  { id: 'JRN-010248', date: '2026-10-29', description: 'Record platform subscription revenue (Oct)', source: 'Subscriptions', route: '/command/finance/subscriptions', status: 'Posted', createdBy: 'System', postedBy: 'System', lines: [dr('1100', 480), cr('4000', 480)] },
];

/** Journals posted this year, including those summarised in the brought-forward entry. */
export const journalCount = 1248;

export const periods: readonly Period[] = [
  { name: 'Sep 2026', start: '2026-09-01', end: '2026-09-30', status: 'Closed', requestedBy: 'Grace Nankya', closedBy: 'Denis Okello' },
  { name: 'Oct 2026', start: '2026-10-01', end: '2026-10-31', status: 'Open' },
  { name: 'Nov 2026', start: '2026-11-01', end: '2026-11-30', status: 'Open' },
];
export const financialYear = 'Jan 1, 2026 – Dec 31, 2026';

export const bank = { account: 'Corporate Main Account – Stanbic Bank (UGX)', code: '1100', statement: 5_920_400_000, income: '4900', charges: '6800' };
export const bankItems: readonly BankItem[] = [
  { id: 'BI-1', description: 'Interest credited by Stanbic, Oct 31', amount: 2_400_000, booked: false },
  { id: 'BI-2', description: 'Bank charges and SMS fees, Oct', amount: -400_000, booked: false },
];

/** Revenue and expenses by month (millions), Jan–Oct 2026. */
export const incomeTrend = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  revenue: [820, 850, 880, 900, 930, 950, 970, 990, 910, 480],
  expenses: [560, 590, 600, 620, 640, 660, 680, 700, 590, 492],
};
