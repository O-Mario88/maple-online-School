/** Maple Command › Finance › Corporate Expenses and Corporate Payroll sample data. Illustrative. */
import type { Expense } from '@/features/command/logic/expenses';
import type { Run, Staff } from '@/features/command/logic/payroll';

import { face, type KpiData } from './shared';

export const TODAY = '2026-10-31';
/** Who records expenses and prepares payroll; the Finance Director approves. */
export const preparer = 'Grace Nankya';
export const approvers = ['Samuel Mugisha (CFO)', 'Esther Achieng (CEO)'] as const;

const rec = (by: string, at: string) => [{ by, action: 'Recorded', at }];

export const expenses: readonly Expense[] = [
  { id: 'EXP-2026-1842', date: '2026-10-29', description: 'Cloud Hosting – Oct 2026', category: 'Cloud & Infra', vendor: 'Amazon Web Services', costCentre: 'Technology', amount: 86_400_000, due: '2026-11-05', receipt: true, status: 'Paid', history: [...rec(preparer, '2026-10-29'), { by: 'Denis Okello', action: 'Approved (1 of 2)', at: '2026-10-29' }, { by: 'Samuel Mugisha', action: 'Approved (2 of 2)', at: '2026-10-29' }, { by: 'Denis Okello', action: 'Paid', at: '2026-10-30' }] },
  { id: 'EXP-2026-1841', date: '2026-10-28', description: 'AI Usage (OpenAI) – Oct 2026', category: 'Software & AI', vendor: 'OpenAI', costCentre: 'Technology', amount: 24_000_000, due: '2026-11-07', receipt: true, status: 'Paid', history: [...rec(preparer, '2026-10-28'), { by: 'Denis Okello', action: 'Paid', at: '2026-10-28' }] },
  { id: 'EXP-2026-1839', date: '2026-10-26', description: 'Live Classes – LiveKit (Oct)', category: 'Cloud & Infra', vendor: 'LiveKit Inc.', costCentre: 'Technology', amount: 24_600_000, due: '2026-11-04', receipt: true, status: 'Pending', history: rec(preparer, '2026-10-26') },
  { id: 'EXP-2026-1836', date: '2026-10-25', description: 'Staff Salaries – Oct 2026', category: 'Salaries & Benefits', vendor: 'Maple HR', costCentre: 'People & Culture', amount: 381_280_000, due: '2026-10-28', receipt: true, status: 'Paid', history: [...rec(preparer, '2026-10-25'), { by: 'Denis Okello', action: 'Paid', at: '2026-10-28' }] },
  { id: 'EXP-2026-1831', date: '2026-10-22', description: 'Digital Marketing – Q4 Campaign', category: 'Marketing & Growth', vendor: 'Growth Agency Ltd.', costCentre: 'Growth', amount: 48_000_000, due: '2026-11-21', receipt: true, status: 'Approved', history: [...rec(preparer, '2026-10-22'), { by: 'Denis Okello', action: 'Approved (1 of 2)', at: '2026-10-23' }, { by: 'Samuel Mugisha', action: 'Approved (2 of 2)', at: '2026-10-24' }] },
  { id: 'EXP-2026-1826', date: '2026-10-20', description: 'Contractor – Curriculum Design', category: 'Contractors & Services', vendor: 'EduMedia Studios', costCentre: 'Content', amount: 36_000_000, due: '2026-10-27', receipt: true, status: 'Pending', history: rec(preparer, '2026-10-20') },
  { id: 'EXP-2026-1820', date: '2026-10-18', description: 'Software Subscriptions (Figma)', category: 'Software & AI', vendor: 'Figma Inc.', costCentre: 'Design & Product', amount: 9_600_000, due: '2026-11-18', receipt: true, status: 'Paid', history: [...rec(preparer, '2026-10-18'), { by: 'Denis Okello', action: 'Paid', at: '2026-10-19' }] },
  { id: 'EXP-2026-1814', date: '2026-10-15', description: 'Office & Admin Expenses', category: 'Admin & Operations', vendor: 'City Supplies Ltd.', costCentre: 'Operations', amount: 6_400_000, due: '2026-11-14', receipt: false, status: 'Paid', history: [...rec(preparer, '2026-10-15'), { by: 'Denis Okello', action: 'Paid', at: '2026-10-16' }] },
];

export const costCentres = ['Technology', 'People & Culture', 'Growth', 'Content', 'Design & Product', 'Operations', 'Finance'] as const;

export const expStats: readonly KpiData[] = [
  { label: 'Total Expenses (YTD)', value: 'UGX 2,846,320,000', delta: '12.8%', icon: 'layers', tone: 'blue' },
  { label: 'Paid Expenses', value: 'UGX 2,316,400,000', caption: '81.4%', icon: 'doc', tone: 'blue' },
  { label: 'Outstanding Payables', value: 'UGX 324,600,000', caption: '11.4%', icon: 'clock', tone: 'orange', valueTone: 'orange' },
  { label: 'Recurring (Monthly)', value: 'UGX 534,280,000', icon: 'calendar', tone: 'purple' },
  { label: 'Budget (YTD)', value: 'UGX 3,200,000,000', icon: 'chart', tone: 'blue' },
  { label: 'Budget Utilization', value: '88.9%', icon: 'check', tone: 'green', progress: 0.889 },
];

/** Whole-company figures; the sample bills are among them. */
export const expTotals = { count: 1842, spent: 2_846_320_000, paid: 2_316_400_000, budget: 3_200_000_000, ap: { total: 324_600_000, overdue: 56_400_000, dueWeek: 96_000_000, dueMonth: 172_200_000 } };

export const expByCategory: readonly { label: string; value: number; color: string }[] = [
  { label: 'Cloud & Infrastructure', value: 814_200_000, color: '#2563EB' },
  { label: 'Salaries & Benefits', value: 628_800_000, color: '#22A55A' },
  { label: 'Software & AI Tools', value: 353_400_000, color: '#F5B731' },
  { label: 'Marketing & Growth', value: 278_400_000, color: '#8B5CF6' },
  { label: 'Contractors & Services', value: 244_800_000, color: '#F28A2E' },
  { label: 'Admin & Operations', value: 214_200_000, color: '#14B8A6' },
  { label: 'Other', value: 312_600_000, color: '#A0AEC0' },
];

/** Actual spend and budget (millions), Jan–Oct 2026. */
export const expTrend = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  actual: [150, 165, 180, 185, 220, 230, 250, 270, 310, 330],
  budget: [190, 230, 240, 250, 275, 285, 295, 305, 320, 345],
};

export const recurring: readonly { name: string; amount: number; badge: string; color: string }[] = [
  { name: 'AWS Cloud Hosting', amount: 86_400_000, badge: 'aws', color: '#F59E0B' },
  { name: 'LiveKit (Live Classes)', amount: 24_600_000, badge: 'LK', color: '#111827' },
  { name: 'OpenAI (AI Usage)', amount: 12_000_000, badge: 'AI', color: '#10A37F' },
  { name: 'Microsoft 365 (Enterprise)', amount: 21_600_000, badge: 'MS', color: '#2563EB' },
  { name: 'Zoom (Meetings & Webinars)', amount: 8_400_000, badge: 'Z', color: '#2D8CFF' },
];

/* ─── Payroll ─── */

export interface StaffRow extends Staff {
  photo: number;
}

const hist = (gross: number) => [{ effective: '2026-01-01', gross, reason: 'Annual review 2026' }];

export const staff: readonly StaffRow[] = [
  { id: 'MPL-0012', name: 'Naome Auma', department: 'Product & Technology', employment: 'Permanent', country: 'UG', gross: 12_500_000, history: hist(12_500_000), photo: face.aisha },
  { id: 'MPL-0021', name: 'Peter Okello', department: 'Learning & Curriculum', employment: 'Permanent', country: 'UG', gross: 10_800_000, history: hist(10_800_000), photo: face.okello },
  { id: 'MPL-0034', name: 'Grace Nambasa', department: 'School Partnerships', employment: 'Permanent', country: 'UG', gross: 9_600_000, history: hist(9_600_000), photo: face.grace },
  { id: 'MPL-0045', name: 'James Odongo', department: 'Finance', employment: 'Permanent', country: 'UG', gross: 12_000_000, history: hist(12_000_000), photo: face.james },
  { id: 'MPL-0056', name: 'Ruth Akello', department: 'People & Culture (HR)', employment: 'Permanent', country: 'UG', gross: 11_400_000, history: hist(11_400_000), photo: face.ruth },
  { id: 'MPL-0067', name: 'David Kintu', department: 'Marketing & Growth', employment: 'Permanent', country: 'UG', gross: 9_000_000, history: hist(9_000_000), photo: face.kato },
  { id: 'MPL-0078', name: 'Irene Nakyeyune', department: 'Operations', employment: 'Contract', country: 'UG', gross: 7_500_000, history: hist(7_500_000), photo: face.esther },
  { id: 'MPL-0089', name: 'Samuel Lutaaya', department: 'IT & Infrastructure', employment: 'Contract', country: 'UG', gross: 8_400_000, history: hist(7_000_000), photo: face.michael },
];

/** September gross pay, for the variance check. */
export const previousGross: Readonly<Record<string, number>> = { 'MPL-0012': 12_500_000, 'MPL-0021': 10_800_000, 'MPL-0034': 9_600_000, 'MPL-0045': 12_000_000, 'MPL-0056': 11_400_000, 'MPL-0067': 9_000_000, 'MPL-0078': 7_500_000, 'MPL-0089': 7_000_000 };

/** October whole-company payroll under the Uganda rules (PAYE, NSSF 5% + 10%, 6% WHT on contracts, 8% benefits); the sample staff are part of it. */
export const payTotals = { employees: 251, gross: 328_000_000, paye: 61_400_000, nssfEmployee: 14_800_000, wht: 1_920_000, deductions: 78_120_000, net: 249_880_000, nssfEmployer: 29_600_000, benefits: 23_680_000, cost: 381_280_000 };

export const payStats: readonly KpiData[] = [
  { label: 'Payroll Cost (Oct)', value: 'UGX 381,280,000', delta: '5.8%', icon: 'database', tone: 'purple' },
  { label: 'Employees', value: '251', caption: 'Active', icon: 'people', tone: 'blue' },
  { label: 'Gross Salaries', value: 'UGX 328,000,000', icon: 'layers', tone: 'green' },
  { label: 'Total Deductions', value: 'UGX 78,120,000', icon: 'shield', tone: 'orange', valueTone: 'red' },
  { label: 'Benefits (Employer)', value: 'UGX 23,680,000', icon: 'heart', tone: 'purple' },
  { label: 'Statutory Obligations', value: 'UGX 107,720,000', icon: 'building', tone: 'red', valueTone: 'red' },
  { label: 'Net Pay', value: 'UGX 249,880,000', icon: 'check', tone: 'green' },
];

/** Net pay and total payroll cost (millions), Nov 2025 – Oct 2026. */
export const payTrend = {
  labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  net: [196, 200, 205, 209, 214, 219, 224, 229, 235, 240, 245, 250],
  total: [300, 305, 312, 318, 326, 334, 342, 350, 358, 366, 374, 381],
};

export const runs: readonly (Run & { amount: number; label: string })[] = [
  { period: 'Oct 2026', label: 'Oct 2026 Payroll', amount: 381_280_000, preparedBy: preparer, approvals: ['Denis Okello', 'Samuel Mugisha (CFO)'], status: 'Approved' },
  { period: 'Nov 2026', label: 'Nov 2026 Payroll (Draft)', amount: 384_900_000, preparedBy: preparer, approvals: [], status: 'Draft' },
  { period: 'Dec 2026 Bonus', label: 'Year-End Bonus (Dec)', amount: 84_000_000, preparedBy: preparer, approvals: [], status: 'Draft' },
];

export const calendar: readonly { label: string; run: string; inDays: number; color: string }[] = [
  { label: 'Nov 2026 Payroll', run: 'Nov 26, 2026', inDays: 26, color: '#22A55A' },
  { label: 'Dec 2026 Payroll', run: 'Dec 24, 2026', inDays: 54, color: '#2563EB' },
  { label: 'Year-End Bonus', run: 'Dec 24, 2026', inDays: 54, color: '#8B5CF6' },
];
