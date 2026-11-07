import { type Account, accountBalance, addAccount, canDelete, canEdit, categoryTree, type Entry, entryTotals, nextEntryId, postEntry, reverseEntry, typeForCode, validateEntry } from './books';

const accounts: readonly Account[] = [
  { code: '1001', name: 'Cash at Bank', type: 'Asset', sub: 'Current Assets', status: 'Active' },
  { code: '4100', name: 'School Fees Income', type: 'Income', sub: 'School Fees', status: 'Active' },
  { code: '4101', name: 'Tuition Fees - Primary', type: 'Income', sub: 'School Fees', status: 'Active', parent: '4100' },
  { code: '5100', name: 'Teacher Salaries', type: 'Expense', sub: 'Academic Expenses', status: 'Active' },
  { code: '5900', name: 'Old Canteen', type: 'Expense', sub: 'Operational Expenses', status: 'Inactive' },
];

const entry = (over: Partial<Entry> = {}): Entry => ({
  id: 'JE-1032',
  date: '2026-10-26',
  description: 'School Fees Collection',
  lines: [
    { account: '1001', debit: 450_000, credit: 0 },
    { account: '4101', debit: 0, credit: 450_000 },
  ],
  status: 'Draft',
  createdBy: 'Mary N.',
  ...over,
});

describe('chart of accounts', () => {
  test('the code says the account type', () => {
    expect(typeForCode('1001')).toBe('Asset');
    expect(typeForCode('2300')).toBe('Liability');
    expect(typeForCode('3100')).toBe('Equity');
    expect(typeForCode('4101')).toBe('Income');
    expect(typeForCode('6200')).toBe('Expense');
    expect(typeForCode('9000')).toBeNull();
  });

  test('a new account needs a free four-digit code in its type range and a real parent', () => {
    const ok = { code: '4102', name: 'Tuition Fees - Secondary', type: 'Income' as const, sub: 'School Fees', parent: '4100' };
    expect(addAccount(accounts, ok).error).toBeUndefined();
    expect(addAccount(accounts, ok).list.at(-1)).toMatchObject({ code: '4102', status: 'Active' });
    expect(addAccount(accounts, { ...ok, code: '4101' }).error).toMatch(/already used/i);
    expect(addAccount(accounts, { ...ok, code: '41' }).error).toMatch(/four digits/i);
    expect(addAccount(accounts, { ...ok, code: '5102' }).error).toMatch(/Income accounts use codes 4000/i);
    expect(addAccount(accounts, { ...ok, parent: '5100' }).error).toMatch(/parent/i);
    expect(addAccount(accounts, { ...ok, name: ' ' }).error).toMatch(/name/i);
  });

  test('an account with entries cannot be deleted, only made inactive', () => {
    expect(canDelete('1001', [entry()]).ok).toBe(false);
    expect(canDelete('5100', [entry()]).ok).toBe(true);
  });

  test('groups accounts by type and sub-category with counts', () => {
    const tree = categoryTree(accounts);
    expect(tree.find((t) => t.type === 'Income')).toEqual({ type: 'Income', count: 2, subs: [{ name: 'School Fees', count: 2 }] });
    expect(tree.find((t) => t.type === 'Expense')?.subs.map((s) => s.name)).toEqual(['Academic Expenses', 'Operational Expenses']);
  });

  test('balances follow the normal side of each account type', () => {
    const posted = [entry({ status: 'Posted' })];
    expect(accountBalance('1001', posted, accounts)).toBe(450_000);
    expect(accountBalance('4101', posted, accounts)).toBe(450_000);
    expect(accountBalance('4101', [entry()], accounts)).toBe(0);
  });
});

describe('journal entries', () => {
  test('totals and balance', () => {
    expect(entryTotals(entry())).toEqual({ debit: 450_000, credit: 450_000, balanced: true });
  });

  test('lists what stops an entry posting', () => {
    expect(validateEntry(entry(), accounts)).toEqual([]);
    const bad = entry({
      lines: [
        { account: '1001', debit: 500_000, credit: 0 },
        { account: '5900', debit: 0, credit: 450_000 },
        { account: '7777', debit: 10, credit: 10 },
      ],
    });
    expect(validateEntry(bad, accounts)).toEqual(['Line 2: 5900 Old Canteen is inactive.', 'Line 3: account 7777 does not exist.', 'Line 3: put the amount on the debit or the credit side, not both.', 'Debits (500,010) and credits (450,010) must be equal.']);
    expect(validateEntry(entry({ lines: [{ account: '1001', debit: 1, credit: 0 }] }), accounts)).toContain('An entry needs at least two lines.');
  });

  test('posting locks the entry', () => {
    const r = postEntry(entry(), accounts, 'Mary N.', 'Oct 26, 2026, 10:25 AM');
    expect(r.entry).toMatchObject({ status: 'Posted', postedBy: 'Mary N.', postedAt: 'Oct 26, 2026, 10:25 AM' });
    expect(canEdit(r.entry)).toBe(false);
    expect(canEdit(entry())).toBe(true);
    expect(postEntry(r.entry, accounts, 'M', 'x').error).toMatch(/already posted/i);
  });

  test('reversing a posted entry swaps every line into a new entry', () => {
    const posted = entry({ status: 'Posted' });
    const r = reverseEntry(posted, 'JE-1033', '2026-10-27', 'Mary N.');
    expect(r.error).toBeUndefined();
    expect(r.reversal).toMatchObject({ id: 'JE-1033', status: 'Reversing', reverses: 'JE-1032', description: 'Reversal of JE-1032: School Fees Collection' });
    expect(r.reversal?.lines).toEqual([
      { account: '1001', debit: 0, credit: 450_000 },
      { account: '4101', debit: 450_000, credit: 0 },
    ]);
    expect(r.original.reversedBy).toBe('JE-1033');
    expect(reverseEntry(entry(), 'JE-1033', '2026-10-27', 'M').error).toMatch(/only posted/i);
    expect(reverseEntry(r.original, 'JE-1034', '2026-10-27', 'M').error).toMatch(/already reversed/i);
  });

  test('ids follow the highest one', () => {
    expect(nextEntryId([entry(), entry({ id: 'JE-1029' })])).toBe('JE-1033');
  });
});
