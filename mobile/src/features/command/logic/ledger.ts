/**
 * Rules behind Maple Command › Finance › Corporate General Ledger. Maple's own ledger reuses the
 * school books' double-entry rules (validate, post, reverse; posted entries never change) and
 * adds the trial balance, the statements, approval-based period close and bank reconciliation.
 * It never posts to an institution's ledger.
 */
import { type Account, accountBalance, type AccountType, type Entry, type JournalLine } from '@/features/school/accounting/books';

export const TB_ORDER: readonly AccountType[] = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'];
const DEBIT_SIDE: ReadonlySet<AccountType> = new Set(['Asset', 'Expense']);

const sumType = (type: AccountType, accounts: readonly Account[], entries: readonly Entry[]) => accounts.filter((a) => a.type === type).reduce((s, a) => s + accountBalance(a.code, entries, accounts), 0);

export function trialBalance(accounts: readonly Account[], entries: readonly Entry[]): { rows: readonly { type: AccountType; debit: number; credit: number }[]; debit: number; credit: number; balanced: boolean } {
  const rows = TB_ORDER.map((type) => {
    const v = sumType(type, accounts, entries);
    return DEBIT_SIDE.has(type) ? { type, debit: v, credit: 0 } : { type, debit: 0, credit: v };
  });
  const debit = rows.reduce((s, r) => s + r.debit, 0);
  const credit = rows.reduce((s, r) => s + r.credit, 0);
  return { rows, debit, credit, balanced: debit === credit };
}

/** Balance-sheet and income figures; equity includes this year's surplus. */
export function statements(accounts: readonly Account[], entries: readonly Entry[]) {
  const revenue = sumType('Income', accounts, entries);
  const expenses = sumType('Expense', accounts, entries);
  const surplus = revenue - expenses;
  return { assets: sumType('Asset', accounts, entries), liabilities: sumType('Liability', accounts, entries), equity: sumType('Equity', accounts, entries) + surplus, revenue, expenses, surplus };
}

export interface Period {
  name: string;
  start: string;
  end: string;
  status: 'Open' | 'Closing' | 'Closed';
  requestedBy?: string;
  closedBy?: string;
}

/** Why an entry dated `date` cannot post, or undefined when it can. */
export function canPostOn(date: string, periods: readonly Period[]): string | undefined {
  const p = periods.find((x) => date >= x.start && date <= x.end);
  if (!p) return `There is no open period for ${date}.`;
  if (p.status === 'Closed') return `${p.name} is closed. Post into the current period or ask for it to be reopened.`;
  return undefined;
}

export function requestClose(p: Period, by: string): { period?: Period; error?: string } {
  if (p.status !== 'Open') return { error: `${p.name} is ${p.status.toLowerCase()}.` };
  return { period: { ...p, status: 'Closing', requestedBy: by } };
}

export interface CloseChecks {
  tbBalanced: boolean;
  bankReconciled: boolean;
  drafts: number;
}

export function approveClose(p: Period, by: string, checks: CloseChecks): { period?: Period; error?: string } {
  if (p.status !== 'Closing') return { error: `Request the close of ${p.name} first.` };
  if (p.requestedBy === by) return { error: 'A different person must approve the close.' };
  if (!checks.tbBalanced) return { error: 'The trial balance does not balance.' };
  if (!checks.bankReconciled) return { error: 'Finish the bank reconciliation before closing.' };
  if (checks.drafts) return { error: `Post or delete the ${checks.drafts} draft journal${checks.drafts > 1 ? 's' : ''} first.` };
  return { period: { ...p, status: 'Closed', closedBy: by } };
}

export interface BankItem {
  id: string;
  description: string;
  /** Positive when the bank holds more than the books (e.g. interest), negative for charges. */
  amount: number;
  booked: boolean;
}

export function bankRec(bank: number, book: number, items: readonly BankItem[]) {
  const difference = bank - book;
  const open = items.filter((i) => !i.booked);
  const explained = open.reduce((s, i) => s + i.amount, 0);
  const unexplained = difference - explained;
  const status = unexplained !== 0 ? 'Unexplained Difference' : difference === 0 ? 'Reconciled' : 'Partially Reconciled';
  return { difference, explained, unexplained, outstanding: open.length, status } as const;
}

/** The journal that brings a bank-only item into the books. */
export function bookItem(item: BankItem, bank: string, income: string, charges: string): readonly JournalLine[] {
  const size = Math.abs(item.amount);
  return item.amount > 0
    ? [
        { account: bank, debit: size, credit: 0 },
        { account: income, debit: 0, credit: size },
      ]
    : [
        { account: charges, debit: size, credit: 0 },
        { account: bank, debit: 0, credit: size },
      ];
}
