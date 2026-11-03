/**
 * The school's books for the Chart of Accounts and Journal Entries pages (Green Valley Academy,
 * Term 1 2026). Balances are opening balances plus the posted entries below. Figures are illustrative.
 */
import type { Account, AccountType, Entry } from '@/features/school/accounting/books';

export interface BookAccount extends Account {
  /** Balance brought forward, in UGX, on the account's normal side. */
  opening: number;
  created: string;
  updated: string;
}

/** Spreads a category's total over its accounts, the first ones carrying the most. */
function spread(total: number, count: number): readonly number[] {
  const weights = Array.from({ length: count }, (_, i) => count - i);
  const sum = weights.reduce((s, w) => s + w, 0);
  return weights.map((w) => Math.round((total * w) / sum / 10_000) * 10_000);
}

type Row = readonly [string, string];

function group(type: AccountType, sub: string, rows: readonly Row[], total: number, parent?: string): readonly BookAccount[] {
  const amounts = spread(total, rows.length);
  return rows.map(([code, name], i) => ({ code, name, type, sub, status: 'Active', parent: i === 0 ? undefined : parent, opening: amounts[i], created: 'Oct 10, 2023, 14:32', updated: 'Oct 25, 2026, 09:18' }));
}

/** Income accounts carry set openings so the top-income list matches the reference. */
function withOpenings(list: readonly BookAccount[], openings: Readonly<Record<string, number>>): readonly BookAccount[] {
  return list.map((a) => ({ ...a, opening: openings[a.code] ?? 0 }));
}

const named = (prefix: number, names: readonly string[]): readonly Row[] => names.map((n, i) => [String(prefix + i), n] as const);

const income: readonly BookAccount[] = [
  ...withOpenings(
    group(
      'Income',
      'School Fees',
      [
        ['4100', 'School Fees Income'],
        ['4101', 'Tuition Fees - Primary'],
        ['4102', 'Tuition Fees - Secondary'],
        ['4103', 'Registration Fees'],
        ['4104', 'Examination Fees'],
        ['4105', 'Boarding Fees'],
        ['4106', 'Lunch Fees'],
        ['4107', 'Uniform Levy'],
      ],
      0,
      '4100',
    ),
    { '4101': 85_000_000, '4102': 62_400_000, '4103': 23_600_000, '4104': 4_200_000, '4105': 3_100_000, '4106': 1_800_000, '4107': 900_000 },
  ),
  ...withOpenings(
    group(
      'Income',
      'Grants & Donations',
      [
        ['4200', 'Grants & Donations'],
        ['4201', 'Government Grants'],
        ['4202', 'NGO Donations'],
        ['4203', 'Alumni Donations'],
      ],
      0,
      '4200',
    ),
    { '4201': 18_500_000, '4202': 6_200_000, '4203': 1_400_000 },
  ),
  ...withOpenings(
    group(
      'Income',
      'Other Income',
      [
        ['4000', 'Revenue'],
        ['4300', 'Other Income'],
        ['4301', 'Book Sales'],
        ['4302', 'Uniform Sales'],
        ['4303', 'Transport Fees'],
        ['4304', 'Rental Income'],
        ['4305', 'Interest Income'],
        ['4306', 'Hall Hire'],
      ],
      0,
    ),
    { '4300': 14_200_000, '4301': 2_600_000, '4302': 2_100_000, '4303': 1_900_000, '4304': 1_200_000, '4305': 600_000, '4306': 400_000 },
  ).map((a) => (a.code > '4300' ? { ...a, parent: '4300' } : a)),
];

const expenses: readonly BookAccount[] = [
  ...group('Expense', 'Academic Expenses', named(5100, ['Teacher Salaries', 'Teaching Materials', 'Exam Printing', 'Library Books', 'Science Lab Supplies', 'ICT Licences', 'Sports & Games', 'Co-curricular Trips', 'Staff Training', 'Learner Welfare']), 52_400_000, '5100'),
  ...group('Expense', 'Operational Expenses', named(5200, ['Electricity (UMEME)', 'Water (NWSC)', 'Internet', 'Repairs & Maintenance', 'Cleaning', 'Rent', 'Security', 'Fuel & Transport', 'Meals & Catering', 'Insurance', 'Generator Fuel', 'Waste Collection']), 44_600_000),
  ...group('Expense', 'Admin & General', named(5300, ['Administrative Salaries', 'Office Stationery', 'Bank Charges', 'Audit Fees', 'Legal Fees', 'Advertising', 'Telephone', 'Board Meetings', 'Licences & Permits', 'Depreciation']), 26_400_000),
];

const assets: readonly BookAccount[] = [
  ...group('Asset', 'Current Assets', named(1001, ['Cash at Bank', 'Fees Account (Centenary)', 'Petty Cash', 'Mobile Money Wallet', 'Fees Receivable', 'Prepaid Expenses', 'Stock - Uniforms', 'Stock - Books']), 112_500_000),
  ...group('Asset', 'Fixed Assets', named(1500, ['Land', 'Computer Equipment', 'Buildings', 'Furniture & Fittings', 'Motor Vehicles', 'Laboratory Equipment']), 352_000_000),
  ...group('Asset', 'Other Assets', named(1800, ['Security Deposits', 'Long-term Investments', 'Intangible Assets', 'Staff Loans']), 18_000_000),
];

const liabilities: readonly BookAccount[] = [
  ...group('Liability', 'Current Liabilities', named(2001, ['Accounts Payable', 'Fees Paid in Advance', 'PAYE Payable', 'NSSF Payable', 'Accrued Expenses', 'Salaries Payable', 'VAT Payable', 'Withholding Tax Payable', 'Short-term Loan', 'Caution Money']), 38_200_000),
  ...group('Liability', 'Long-term Liabilities', named(2500, ['Bank Loan (Stanbic)', 'Building Loan', 'Asset Finance', 'Deferred Grants', 'Staff Gratuity', 'Other Long-term Debt']), 24_000_000),
];

const equity: readonly BookAccount[] = [
  ...group('Equity', 'Capital & Reserves', named(3001, ['Founders Capital', 'Accumulated Fund', 'Capital Reserve', 'Building Reserve', 'Revaluation Reserve', 'Scholarship Fund']), 18_600_000),
  ...group('Equity', 'Retained Earnings', named(3100, ['Retained Surplus', 'Current Year Surplus']), 5_600_000),
];

const DESCRIPTIONS: Readonly<Record<string, string>> = { '4101': 'Fees for Primary section students', '4102': 'Fees for Secondary section students', '1001': 'Stanbic Bank main operating account' };

export const accounts: readonly BookAccount[] = [...income, ...expenses, ...assets, ...liabilities, ...equity].map((a) => (DESCRIPTIONS[a.code] ? { ...a, description: DESCRIPTIONS[a.code] } : a));

/** The account the Chart of Accounts page opens with, as in the reference. */
export const featuredAccount = '4101';

/** Cash and bank accounts, for the "Is Bank Account" detail. */
export const bankCodes: readonly string[] = ['1001', '1002', '1004'];

interface Seed {
  id: string;
  date: string;
  description: string;
  dr: string;
  cr: string;
  amount: number;
  status: Entry['status'];
  by: string;
  time: string;
  posted?: string;
  recurring?: boolean;
  reverses?: string;
  note?: string;
}

const seeds: readonly Seed[] = [
  { id: 'JE-1032', date: '2026-10-26', description: 'School Fees Collection', dr: '1001', cr: '4101', amount: 450_000, status: 'Posted', by: 'Mary N.', time: '10:24 AM', posted: '10:25 AM', note: 'Payment received from Green Valley Academy - Term 1 fees.' },
  { id: 'JE-1031', date: '2026-10-26', description: 'Purchase of Laptops', dr: '1501', cr: '2001', amount: 8_500_000, status: 'Draft', by: 'James O.', time: '09:12 AM', note: '20 laptops for the ICT lab (ICT Solutions, bill B-0014).' },
  { id: 'JE-1030', date: '2026-10-25', description: 'Teacher Salaries', dr: '5100', cr: '1001', amount: 12_000_000, status: 'Posted', by: 'Sarah N.', time: '04:38 PM', recurring: true },
  { id: 'JE-1029', date: '2026-10-24', description: 'Bank Transfer', dr: '1002', cr: '1001', amount: 3_000_000, status: 'Posted', by: 'Peter M.', time: '02:17 PM' },
  { id: 'JE-1028', date: '2026-10-24', description: 'Utility Bill (UMEME)', dr: '5200', cr: '1001', amount: 850_000, status: 'Posted', by: 'Lydia B.', time: '11:05 AM', recurring: true },
  { id: 'JE-1027', date: '2026-10-23', description: 'Registration Fees', dr: '1001', cr: '4103', amount: 1_200_000, status: 'Posted', by: 'Mary N.', time: '10:40 AM' },
  { id: 'JE-1026', date: '2026-10-22', description: 'Library Books Purchase', dr: '5103', cr: '1001', amount: 650_000, status: 'Posted', by: 'Daniel O.', time: '03:22 PM' },
  { id: 'JE-1025', date: '2026-10-22', description: 'Donations Received', dr: '1001', cr: '4203', amount: 2_500_000, status: 'Posted', by: 'Grace A.', time: '12:10 PM' },
  { id: 'JE-1024', date: '2026-10-21', description: 'Student Refund', dr: '4101', cr: '1001', amount: 300_000, status: 'Reversing', by: 'Mary N.', time: '09:45 AM', reverses: 'JE-1018' },
  { id: 'JE-1023', date: '2026-10-20', description: 'Rent Payment', dr: '5205', cr: '1001', amount: 1_800_000, status: 'Posted', by: 'Sarah N.', time: '08:30 AM', recurring: true },
];

export interface BookEntry extends Entry {
  createdAt: string;
  source: string;
  notes: string;
  attachments: readonly string[];
}

export const dayLabel = (iso: string): string => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export const entries: readonly BookEntry[] = seeds.map((s) => ({
  id: s.id,
  date: s.date,
  description: s.description,
  lines: [
    { account: s.dr, debit: s.amount, credit: 0 },
    { account: s.cr, debit: 0, credit: s.amount },
  ],
  status: s.status,
  createdBy: s.by,
  createdAt: `${dayLabel(s.date)}, ${s.time}`,
  postedBy: s.status === 'Draft' ? undefined : s.by,
  postedAt: s.status === 'Draft' ? undefined : `${dayLabel(s.date)}, ${s.posted ?? s.time}`,
  recurring: s.recurring,
  reverses: s.reverses,
  source: s.recurring ? 'Recurring Entry' : 'Manual Entry',
  notes: s.note ?? s.description,
  attachments: s.id === 'JE-1032' ? ['Receipt_RCT-20261026-118.pdf'] : [],
}));

/** Term totals for the tabs and tiles; the sample entries are the newest of them. */
export const entryTotals = { all: 486, Draft: 38, Posted: 432, Reversing: 16, Recurring: 24 };

/** Twelve monthly balances for the selected account, in millions of UGX. */
export const balanceTrend = { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], values: [60, 110, 150, 120, 150, 140, 180, 190, 170, 190, 180, 280] };

export const terms = ['Term 1, 2026', 'Term 2, 2026', 'Term 3, 2026'];
export const years = ['2026', '2025'];
export const campuses = ['Main Campus', 'Ntinda Campus'];
export const today = '2026-10-26';
