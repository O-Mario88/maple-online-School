import { adjust, awaiting, batchFor, disburse, eligibility, liability, openDispute, owed, recordEarning, releaseReserve, resolveDispute, type TeacherPayable, withdrawable } from './payables';

const t = (over: Partial<TeacherPayable> = {}): TeacherPayable => ({ id: 'TCH-000184', name: 'Agnes Nanyonjo', earned: 48_600_000, paid: 40_000_000, reserve: 2_600_000, dispute: 0, ...over });

describe('what a teacher is owed', () => {
  test('owed is earned less paid; it splits into awaiting release, reserve and dispute', () => {
    expect(owed(t())).toBe(8_600_000);
    expect(awaiting(t())).toBe(6_000_000);
    expect(awaiting(t({ earned: 36_000_000, paid: 24_000_000, reserve: 2_000_000, dispute: 2_000_000 }))).toBe(8_000_000);
  });

  test('eligibility: disputes and holds block payout; tiny balances wait for the minimum', () => {
    expect(eligibility(t())).toBe('Eligible');
    expect(eligibility(t({ dispute: 2_000_000 }))).toBe('Dispute');
    expect(eligibility(t({ hold: 'Tax ID missing' }))).toBe('On Hold');
    expect(eligibility(t({ earned: 42_630_000 }))).toBe('Below Minimum');
  });

  test('only eligible money can be withdrawn; the rest stays owed', () => {
    expect(withdrawable(t())).toBe(6_000_000);
    expect(withdrawable(t({ hold: 'Tax ID missing' }))).toBe(0);
    expect(owed(t({ hold: 'Tax ID missing' }))).toBe(8_600_000);
  });

  test('the liability register keeps disputed and reserved funds visible', () => {
    const l = liability([t(), t({ id: 'b', earned: 36_000_000, paid: 24_000_000, reserve: 2_000_000, dispute: 2_000_000 })]);
    expect(l).toEqual({ awaiting: 14_000_000, reserve: 4_600_000, dispute: 2_000_000, total: 20_600_000 });
  });
});

describe('movements, each with its journal entry', () => {
  test('an earning creates a payable and holds back the reserve', () => {
    const r = recordEarning(t(), 1_000_000);
    expect(r.payable).toMatchObject({ earned: 49_600_000, reserve: 2_650_000 });
    expect(r.entry).toEqual([
      { account: '5100 Teacher Earnings', debit: 1_000_000, credit: 0 },
      { account: '2300 Teacher Payables', debit: 0, credit: 1_000_000 },
    ]);
  });

  test('a disbursement reduces the payable and cannot exceed what is withdrawable', () => {
    expect(disburse(t(), 7_000_000).error).toMatch(/withdraw/i);
    expect(disburse(t({ hold: 'KYC' }), 1).error).toMatch(/on hold/i);
    const r = disburse(t(), 6_000_000);
    expect(r.payable && owed(r.payable)).toBe(2_600_000);
    expect(r.entry?.[0]).toEqual({ account: '2300 Teacher Payables', debit: 6_000_000, credit: 0 });
  });

  test('adjustments need a reason and post a journal; they cannot push the balance below zero', () => {
    expect(adjust(t(), 500_000, ' ').error).toMatch(/reason/i);
    expect(adjust(t(), -9_000_000, 'Refunded class').error).toMatch(/below zero/i);
    const r = adjust(t(), -600_000, 'Class refunded to parent');
    expect(r.payable?.earned).toBe(48_000_000);
    expect(r.entry).toEqual([
      { account: '2300 Teacher Payables', debit: 600_000, credit: 0 },
      { account: '5100 Teacher Earnings', debit: 0, credit: 600_000 },
    ]);
  });

  test('disputes move money out of awaiting; resolution returns it or reverses it', () => {
    expect(openDispute(t(), 7_000_000).error).toMatch(/awaiting/i);
    const d = openDispute(t(), 2_000_000).payable as TeacherPayable;
    expect([awaiting(d), d.dispute]).toEqual([4_000_000, 2_000_000]);
    expect(awaiting(resolveDispute(d, true).payable)).toBe(6_000_000);
    const lost = resolveDispute(d, false);
    expect([lost.payable.dispute, lost.payable.earned, owed(lost.payable)]).toEqual([0, 46_600_000, 6_600_000]);
    expect(lost.entry?.[0].account).toBe('2300 Teacher Payables');
  });

  test('releasing reserve makes it payable', () => {
    expect(awaiting(releaseReserve(t(), 2_600_000))).toBe(8_600_000);
    expect(releaseReserve(t(), 9_000_000).reserve).toBe(0);
  });

  test('a payout batch takes every eligible teacher at their withdrawable amount', () => {
    const b = batchFor([t(), t({ id: 'x', hold: 'KYC' }), t({ id: 'y', dispute: 1_000_000 })]);
    expect(b).toEqual({ teachers: 1, total: 6_000_000, skipped: 2 });
  });
});
