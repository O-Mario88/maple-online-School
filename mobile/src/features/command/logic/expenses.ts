/**
 * Rules behind Maple Command › Finance › Corporate Expenses & Accounts Payable. Every expense
 * becomes a payable on Maple's own corporate ledger (never a school's), carries its cost centre
 * and receipt, and keeps an approval history from recording to payment.
 */

export type Category = 'Cloud & Infra' | 'Software & AI' | 'Salaries & Benefits' | 'Marketing & Growth' | 'Contractors & Services' | 'Admin & Operations';
export type ExpenseStatus = 'Pending' | 'Approved' | 'Paid' | 'Rejected';

export interface Step {
  by: string;
  action: string;
  at: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: Category;
  vendor: string;
  costCentre: string;
  amount: number;
  due: string;
  receipt: boolean;
  status: ExpenseStatus;
  history: readonly Step[];
}

export interface Posting {
  ledger: string;
  lines: readonly { account: string; debit: number; credit: number }[];
}

/** Maple's own books; school ledgers are separate and never posted from here. */
export const CORPORATE_LEDGER = 'MAPLE-CORP';
export const CATEGORY_ACCOUNT: Readonly<Record<Category, string>> = {
  'Cloud & Infra': '6200 Cloud & Infrastructure',
  'Software & AI': '6210 Software & AI Tools',
  'Salaries & Benefits': '6000 Salaries & Benefits',
  'Marketing & Growth': '6300 Marketing & Growth',
  'Contractors & Services': '6400 Contractors & Services',
  'Admin & Operations': '6500 Admin & Operations',
};
const AP = '2100 Accounts Payable';
const BANK = '1100 Bank – Operating';
/** Receipts are required at or above this amount. */
export const RECEIPT_LIMIT = 500_000;
/** Bills above this need two approvers. */
export const DUAL_APPROVAL = 10_000_000;
const DAY_MS = 86_400_000;
const WEEK = 7;
const MONTH = 30;

const post = (debit: string, credit: string, amount: number): Posting => ({
  ledger: CORPORATE_LEDGER,
  lines: [
    { account: debit, debit: amount, credit: 0 },
    { account: credit, debit: 0, credit: amount },
  ],
});

export interface NewExpense {
  description: string;
  category: Category;
  vendor: string;
  costCentre: string;
  amount: number;
  due: string;
  receipt: boolean;
  by: string;
  date: string;
}

export function recordExpense(n: NewExpense, id: string): { expense?: Expense; entry?: Posting; error?: string } {
  if (!n.vendor.trim()) return { error: 'Enter the vendor.' };
  if (!n.costCentre.trim()) return { error: 'Choose the cost centre.' };
  if (!(n.amount > 0)) return { error: 'Enter the amount.' };
  if (n.amount >= RECEIPT_LIMIT && !n.receipt) return { error: `Attach the receipt or invoice: it is required from UGX ${RECEIPT_LIMIT.toLocaleString('en-US')}.` };
  if (Number.isNaN(Date.parse(n.due))) return { error: 'Enter the due date as YYYY-MM-DD.' };
  const expense: Expense = { id, date: n.date, description: n.description.trim() || n.vendor.trim(), category: n.category, vendor: n.vendor.trim(), costCentre: n.costCentre, amount: n.amount, due: n.due, receipt: n.receipt, status: 'Pending', history: [{ by: n.by, action: 'Recorded', at: n.date }] };
  return { expense, entry: post(CATEGORY_ACCOUNT[n.category], AP, n.amount) };
}

const approvals = (e: Expense) => e.history.filter((h) => h.action.startsWith('Approved'));

export function approve(e: Expense, by: string, at: string): { expense?: Expense; error?: string } {
  if (e.status !== 'Pending') return { error: `${e.id} is ${e.status.toLowerCase()}, not awaiting approval.` };
  if (e.history[0]?.by === by) return { error: 'The person who recorded an expense cannot approve it.' };
  const done = approvals(e);
  if (done.some((h) => h.by === by)) return { error: 'You have approved this already; a second, different approver is needed.' };
  const needed = e.amount > DUAL_APPROVAL ? 2 : 1;
  const action = needed === 2 ? `Approved (${done.length + 1} of 2)` : 'Approved';
  const history = [...e.history, { by, action, at }];
  return { expense: { ...e, history, status: done.length + 1 >= needed ? 'Approved' : 'Pending' } };
}

export function pay(e: Expense, by: string, at: string): { expense?: Expense; entry?: Posting; error?: string } {
  if (e.status !== 'Approved') return { error: `${e.id} must be approved before it is paid.` };
  return { expense: { ...e, status: 'Paid', history: [...e.history, { by, action: 'Paid', at }] }, entry: post(AP, BANK, e.amount) };
}

export function reject(e: Expense, by: string, reason: string, at: string): { expense?: Expense; error?: string } {
  if (!reason.trim()) return { error: 'Give the reason for rejecting it.' };
  if (e.status === 'Paid') return { error: 'A paid expense cannot be rejected; record a refund instead.' };
  return { expense: { ...e, status: 'Rejected', history: [...e.history, { by, action: `Rejected: ${reason.trim()}`, at }] } };
}

/** What is still owed (pending or approved), by when it falls due. */
export function apSummary(list: readonly Expense[], today: string): { total: number; overdue: number; dueWeek: number; dueMonth: number } {
  const open = list.filter((e) => e.status === 'Pending' || e.status === 'Approved');
  const days = (e: Expense) => Math.round((Date.parse(e.due) - Date.parse(today)) / DAY_MS);
  const sum = (xs: readonly Expense[]) => xs.reduce((s, e) => s + e.amount, 0);
  return { total: sum(open), overdue: sum(open.filter((e) => days(e) < 0)), dueWeek: sum(open.filter((e) => days(e) >= 0 && days(e) <= WEEK)), dueMonth: sum(open.filter((e) => days(e) > WEEK && days(e) <= MONTH)) };
}

export const budgetUse = (spent: number, budget: number): number => (budget ? (spent / budget) * 100 : 0);
