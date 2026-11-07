import type { Account, Entry } from '@/features/school/accounting/books';

import { approveClose, bankRec, bookItem, canPostOn, type Period, requestClose, statements, trialBalance } from './ledger';

const acc = (code: string, name: string, type: Account['type']): Account => ({ code, name, type, sub: name, status: 'Active' });
const ACCOUNTS: readonly Account[] = [acc('1100', 'Bank', 'Asset'), acc('1310', 'Accum. Depreciation', 'Asset'), acc('2100', 'Accounts Payable', 'Liability'), acc('3000', 'Share Capital', 'Equity'), acc('4000', 'Revenue', 'Income'), acc('4900', 'Interest', 'Income'), acc('6700', 'Depreciation', 'Expense'), acc('6800', 'Bank Charges', 'Expense')];
const je = (id: string, lines: Entry['lines'], status: Entry['status'] = 'Posted'): Entry => ({ id, date: '2026-10-10', description: id, lines, status, createdBy: 'x' });
const ENTRIES: readonly Entry[] = [
  je('OPEN', [
    { account: '1100', debit: 1_000, credit: 0 },
    { account: '3000', debit: 0, credit: 1_000 },
  ]),
  je('SALE', [
    { account: '1100', debit: 500, credit: 0 },
    { account: '4000', debit: 0, credit: 500 },
  ]),
  je('DEP', [
    { account: '6700', debit: 40, credit: 0 },
    { account: '1310', debit: 0, credit: 40 },
  ]),
  je('BILL', [
    { account: '6800', debit: 60, credit: 0 },
    { account: '2100', debit: 0, credit: 60 },
  ]),
  je('DRAFT', [
    { account: '1100', debit: 999, credit: 0 },
    { account: '4000', debit: 0, credit: 999 },
  ], 'Draft'),
];

describe('trial balance and statements', () => {
  test('the trial balance sums posted balances by type and balances', () => {
    const tb = trialBalance(ACCOUNTS, ENTRIES);
    expect(tb.rows).toEqual([
      { type: 'Asset', debit: 1_460, credit: 0 },
      { type: 'Liability', debit: 0, credit: 60 },
      { type: 'Equity', debit: 0, credit: 1_000 },
      { type: 'Income', debit: 0, credit: 500 },
      { type: 'Expense', debit: 100, credit: 0 },
    ]);
    expect([tb.debit, tb.credit, tb.balanced]).toEqual([1_560, 1_560, true]);
  });

  test('statements: equity includes the surplus; assets equal liabilities plus equity', () => {
    const s = statements(ACCOUNTS, ENTRIES);
    expect(s).toEqual({ assets: 1_460, liabilities: 60, equity: 1_400, revenue: 500, expenses: 100, surplus: 400 });
    expect(s.assets).toBe(s.liabilities + s.equity);
  });
});

describe('periods', () => {
  const periods: readonly Period[] = [
    { name: 'Sep 2026', start: '2026-09-01', end: '2026-09-30', status: 'Closed' },
    { name: 'Oct 2026', start: '2026-10-01', end: '2026-10-31', status: 'Open' },
  ];

  test('nothing posts into a closed period', () => {
    expect(canPostOn('2026-09-15', periods)).toMatch(/closed/i);
    expect(canPostOn('2026-10-15', periods)).toBeUndefined();
    expect(canPostOn('2027-03-01', periods)).toMatch(/no open period/i);
  });

  test('closing needs a request, then a different approver, a balanced trial balance, a reconciled bank and no drafts', () => {
    const p = requestClose(periods[1], 'Grace Nankya').period as Period;
    expect(p).toMatchObject({ status: 'Closing', requestedBy: 'Grace Nankya' });
    const ok = { tbBalanced: true, bankReconciled: true, drafts: 0 };
    expect(approveClose(p, 'Grace Nankya', ok).error).toMatch(/different/i);
    expect(approveClose(p, 'Denis Okello', { ...ok, bankReconciled: false }).error).toMatch(/bank/i);
    expect(approveClose(p, 'Denis Okello', { ...ok, drafts: 2 }).error).toMatch(/2 draft/i);
    expect(approveClose(periods[1], 'Denis Okello', ok).error).toMatch(/request/i);
    expect(approveClose(p, 'Denis Okello', ok).period?.status).toBe('Closed');
  });
});

describe('bank reconciliation', () => {
  const items = [
    { id: 'i1', description: 'Interest credited by bank', amount: 2_400_000, booked: false },
    { id: 'i2', description: 'Bank charges', amount: -400_000, booked: false },
  ];

  test('the difference is explained by items not yet in the books', () => {
    expect(bankRec(5_920_400_000, 5_918_400_000, items)).toEqual({ difference: 2_000_000, explained: 2_000_000, unexplained: 0, outstanding: 2, status: 'Partially Reconciled' });
    expect(bankRec(5_920_400_000, 5_920_400_000, items.map((i) => ({ ...i, booked: true }))).status).toBe('Reconciled');
    expect(bankRec(5_920_400_000, 5_918_000_000, items).status).toBe('Unexplained Difference');
  });

  test('booking an item posts it to the bank account', () => {
    expect(bookItem(items[0], '1100', '4900', '6800')).toEqual([
      { account: '1100', debit: 2_400_000, credit: 0 },
      { account: '4900', debit: 0, credit: 2_400_000 },
    ]);
    expect(bookItem(items[1], '1100', '4900', '6800')).toEqual([
      { account: '6800', debit: 400_000, credit: 0 },
      { account: '1100', debit: 0, credit: 400_000 },
    ]);
  });
});
