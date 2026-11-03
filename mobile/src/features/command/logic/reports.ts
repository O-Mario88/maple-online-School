/**
 * Rules behind Maple Command › Finance › Platform Financial Reports. Statements are built from the
 * corporate ledger's posted entries, never typed in, and every generated report records the
 * ledger checksum it was built from so an auditor can rebuild exactly the same figures.
 */
import { type Account, accountBalance, type Entry } from '@/features/school/accounting/books';

const NON_CURRENT_ASSETS = new Set(['Fixed Assets']);
const NON_CURRENT_LIABILITIES = new Set(['Long-term']);
const COST_OF_SALES = 'Cost of Sales';
const OTHER_INCOME = 'Other Income';

const total = (accounts: readonly Account[], entries: readonly Entry[], pick: (a: Account) => boolean) => accounts.filter(pick).reduce((s, a) => s + accountBalance(a.code, entries, accounts), 0);

export function profitAndLoss(accounts: readonly Account[], entries: readonly Entry[]) {
  const revenue = total(accounts, entries, (a) => a.type === 'Income' && a.sub !== OTHER_INCOME);
  const otherIncome = total(accounts, entries, (a) => a.type === 'Income' && a.sub === OTHER_INCOME);
  const costOfSales = total(accounts, entries, (a) => a.type === 'Expense' && a.sub === COST_OF_SALES);
  const operatingExpenses = total(accounts, entries, (a) => a.type === 'Expense' && a.sub !== COST_OF_SALES);
  const grossProfit = revenue - costOfSales;
  const operatingProfit = grossProfit - operatingExpenses;
  const netProfit = operatingProfit + otherIncome;
  return { revenue, costOfSales, grossProfit, operatingExpenses, operatingProfit, otherIncome, netProfit, margin: revenue ? Math.round((netProfit / revenue) * 1000) / 10 : 0 };
}

export function balanceSheet(accounts: readonly Account[], entries: readonly Entry[]) {
  const currentAssets = total(accounts, entries, (a) => a.type === 'Asset' && !NON_CURRENT_ASSETS.has(a.sub));
  const nonCurrentAssets = total(accounts, entries, (a) => a.type === 'Asset' && NON_CURRENT_ASSETS.has(a.sub));
  const currentLiabilities = total(accounts, entries, (a) => a.type === 'Liability' && !NON_CURRENT_LIABILITIES.has(a.sub));
  const nonCurrentLiabilities = total(accounts, entries, (a) => a.type === 'Liability' && NON_CURRENT_LIABILITIES.has(a.sub));
  const shareCapital = total(accounts, entries, (a) => a.type === 'Equity' && a.sub === 'Capital');
  const retainedEarnings = total(accounts, entries, (a) => a.type === 'Equity' && a.sub !== 'Capital') + profitAndLoss(accounts, entries).netProfit;
  const totalAssets = currentAssets + nonCurrentAssets;
  const totalLiabilitiesAndEquity = currentLiabilities + nonCurrentLiabilities + shareCapital + retainedEarnings;
  return { currentAssets, nonCurrentAssets, currentLiabilities, nonCurrentLiabilities, shareCapital, retainedEarnings, totalAssets, totalLiabilitiesAndEquity, balanced: totalAssets === totalLiabilitiesAndEquity };
}

/** FNV-1a over every posted entry and line: the fingerprint of the ledger a report was built from. */
export function checksum(entries: readonly Entry[]): string {
  const text = entries.map((e) => `${e.id}|${e.status}|${e.date}|${e.lines.map((l) => `${l.account}:${l.debit}:${l.credit}`).join(',')}`).join(';');
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export type ReportKind = 'Profit & Loss' | 'Balance Sheet' | 'Cash Flow' | 'Changes in Equity' | 'General Ledger';

export interface GeneratedReport {
  id: string;
  kind: ReportKind;
  period: string;
  by: string;
  at: string;
  entries: number;
  checksum: string;
  /** The report's bottom line: net profit, total assets, or the entry count. */
  headline: number;
}

export function generateReport(kind: ReportKind, period: string, accounts: readonly Account[], entries: readonly Entry[], by: string, at: string, id: string): GeneratedReport {
  const headline = kind === 'Balance Sheet' ? balanceSheet(accounts, entries).totalAssets : kind === 'General Ledger' ? entries.length : profitAndLoss(accounts, entries).netProfit;
  return { id, kind, period, by, at, entries: entries.length, checksum: checksum(entries), headline };
}
