import { apSummary, approve, budgetUse, CORPORATE_LEDGER, type Expense, pay, recordExpense, reject } from './expenses';

const TODAY = '2026-10-31';
const exp = (over: Partial<Expense> = {}): Expense => ({
  id: 'EXP-1',
  date: '2026-10-29',
  description: 'Cloud Hosting – Oct 2026',
  category: 'Cloud & Infra',
  vendor: 'Amazon Web Services',
  costCentre: 'Technology',
  amount: 86_400_000,
  due: '2026-11-15',
  receipt: true,
  status: 'Pending',
  history: [{ by: 'Grace Nankya', action: 'Recorded', at: '2026-10-29' }],
  ...over,
});
const input = { description: 'Figma seats', category: 'Software & AI' as const, vendor: 'Figma Inc.', costCentre: 'Design & Product', amount: 9_600_000, due: '2026-11-20', receipt: true, by: 'Grace Nankya', date: TODAY };

describe('recording expenses into accounts payable', () => {
  test('needs a vendor, a cost centre, an amount and a receipt above the limit', () => {
    expect(recordExpense({ ...input, vendor: ' ' }, 'EXP-2').error).toMatch(/vendor/i);
    expect(recordExpense({ ...input, costCentre: '' }, 'EXP-2').error).toMatch(/cost cent/i);
    expect(recordExpense({ ...input, amount: 0 }, 'EXP-2').error).toMatch(/amount/i);
    expect(recordExpense({ ...input, receipt: false }, 'EXP-2').error).toMatch(/receipt/i);
    expect(recordExpense({ ...input, amount: 300_000, receipt: false }, 'EXP-2').expense?.status).toBe('Pending');
  });

  test('posts to the corporate ledger: Dr the category expense, Cr Accounts Payable', () => {
    const r = recordExpense(input, 'EXP-2');
    expect(r.expense).toMatchObject({ id: 'EXP-2', status: 'Pending', history: [{ by: 'Grace Nankya', action: 'Recorded', at: TODAY }] });
    expect(r.entry).toEqual({
      ledger: CORPORATE_LEDGER,
      lines: [
        { account: '6210 Software & AI Tools', debit: 9_600_000, credit: 0 },
        { account: '2100 Accounts Payable', debit: 0, credit: 9_600_000 },
      ],
    });
  });
});

describe('approval and payment', () => {
  test('large bills need two different approvers; the person who recorded it cannot approve', () => {
    expect(approve(exp(), 'Grace Nankya', TODAY).error).toMatch(/recorded/i);
    const first = approve(exp(), 'Denis Okello', TODAY).expense as Expense;
    expect(first.status).toBe('Pending');
    expect(approve(first, 'Denis Okello', TODAY).error).toMatch(/second/i);
    const second = approve(first, 'Samuel Mugisha', TODAY).expense as Expense;
    expect(second.status).toBe('Approved');
    expect(second.history.map((h) => h.action)).toEqual(['Recorded', 'Approved (1 of 2)', 'Approved (2 of 2)']);
    expect(approve(exp({ amount: 6_400_000 }), 'Denis Okello', TODAY).expense?.status).toBe('Approved');
  });

  test('only approved bills are paid; payment clears Accounts Payable', () => {
    expect(pay(exp(), 'Denis Okello', TODAY).error).toMatch(/approved/i);
    const r = pay(exp({ status: 'Approved' }), 'Denis Okello', TODAY);
    expect(r.expense?.status).toBe('Paid');
    expect(r.entry?.lines[0]).toEqual({ account: '2100 Accounts Payable', debit: 86_400_000, credit: 0 });
  });

  test('rejection needs a reason and is kept on the audit trail', () => {
    expect(reject(exp(), 'Denis Okello', '', TODAY).error).toMatch(/reason/i);
    const r = reject(exp(), 'Denis Okello', 'Duplicate invoice', TODAY).expense as Expense;
    expect([r.status, r.history.at(-1)?.action]).toEqual(['Rejected', 'Rejected: Duplicate invoice']);
  });
});

describe('payables and budget', () => {
  test('summary of what is owed by due date', () => {
    const s = apSummary([exp({ due: '2026-10-20' }), exp({ due: '2026-11-05' }), exp({ due: '2026-11-20', status: 'Approved' }), exp({ status: 'Paid' })], TODAY);
    expect(s).toEqual({ total: 259_200_000, overdue: 86_400_000, dueWeek: 86_400_000, dueMonth: 86_400_000 });
  });

  test('budget use', () => {
    expect(budgetUse(2_846_320_000, 3_200_000_000)).toBeCloseTo(88.9, 1);
  });
});
