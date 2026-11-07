import type { Account, Entry } from '@/features/school/accounting/books';

import { balanceSheet, checksum, generateReport, profitAndLoss } from './reports';

const acc = (code: string, type: Account['type'], sub: string): Account => ({ code, name: code, type, sub, status: 'Active' });
const ACCOUNTS: readonly Account[] = [acc('1100', 'Asset', 'Cash & Bank'), acc('1300', 'Asset', 'Fixed Assets'), acc('2100', 'Liability', 'Payables'), acc('2500', 'Liability', 'Long-term'), acc('3000', 'Equity', 'Capital'), acc('3100', 'Equity', 'Reserves'), acc('4000', 'Income', 'Revenue'), acc('4900', 'Income', 'Other Income'), acc('5100', 'Expense', 'Cost of Sales'), acc('6000', 'Expense', 'Operating')];
const L = (account: string, debit: number, credit: number) => ({ account, debit, credit });
const E: readonly Entry[] = [
  { id: 'A', date: '2026-01-01', description: 'open', status: 'Posted', createdBy: 'x', lines: [L('1100', 600, 0), L('1300', 400, 0), L('2500', 0, 300), L('3000', 0, 500), L('3100', 0, 200)] },
  { id: 'B', date: '2026-02-01', description: 'trade', status: 'Posted', createdBy: 'x', lines: [L('1100', 1_010, 0), L('4000', 0, 1_000), L('4900', 0, 10)] },
  { id: 'C', date: '2026-03-01', description: 'costs', status: 'Posted', createdBy: 'x', lines: [L('5100', 300, 0), L('6000', 400, 0), L('2100', 0, 700)] },
];

describe('statements from the ledger', () => {
  test('profit and loss keeps gross, operating and net profit apart', () => {
    expect(profitAndLoss(ACCOUNTS, E)).toEqual({ revenue: 1_000, costOfSales: 300, grossProfit: 700, operatingExpenses: 400, operatingProfit: 300, otherIncome: 10, netProfit: 310, margin: 31 });
  });

  test('balance sheet splits current and non-current; retained earnings include this year', () => {
    const b = balanceSheet(ACCOUNTS, E);
    expect(b).toEqual({ currentAssets: 1_610, nonCurrentAssets: 400, currentLiabilities: 700, nonCurrentLiabilities: 300, shareCapital: 500, retainedEarnings: 510, totalAssets: 2_010, totalLiabilitiesAndEquity: 2_010, balanced: true });
  });
});

describe('auditable reports', () => {
  test('the checksum is the same for the same ledger and changes when it changes', () => {
    expect(checksum(E)).toBe(checksum([...E]));
    expect(checksum(E)).not.toBe(checksum(E.slice(0, 2)));
    expect(checksum(E)).toMatch(/^[0-9a-f]{8}$/);
  });

  test('a generated report records who, when, the ledger checksum and its figures', () => {
    const r = generateReport('Profit & Loss', 'Jan – Oct 2026', ACCOUNTS, E, 'Denis Okello', '2026-10-31 10:24', 'RPT-0001');
    expect(r).toMatchObject({ id: 'RPT-0001', kind: 'Profit & Loss', by: 'Denis Okello', entries: 3, checksum: checksum(E) });
    expect(r.headline).toBe(310);
  });
});
