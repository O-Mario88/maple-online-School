import { arr, cancel, changePlan, chargeEntries, dunningStep, monthlyValue, mrr, netRecurring, type Plan, recoverPayment, renewalsDue, type Sub } from './subscriptions';

const plans: readonly Plan[] = [
  { id: 'basic', name: 'School Basic', type: 'School', price: 250_000 },
  { id: 'standard', name: 'School Standard', type: 'School', price: 500_000 },
  { id: 'premium', name: 'School Premium', type: 'School', price: 1_200_000 },
  { id: 'plus', name: 'Learner Plus', type: 'Learner', price: 25_000 },
];

const sub = (over: Partial<Sub> = {}): Sub => ({ id: 'SCH-00184', subscriber: 'Green Valley School', plan: 'premium', billing: 'Annual', start: '2026-01-15', nextRenewal: '2027-01-15', status: 'Active', failedAttempts: 0, ...over });

describe('recurring revenue', () => {
  test('monthly value follows the billing cycle; trials and cancelled count nothing', () => {
    expect(monthlyValue(sub({ billing: 'Monthly' }), plans)).toBe(1_200_000);
    expect(monthlyValue(sub({ billing: 'Annual' }), plans)).toBe(1_200_000);
    expect(monthlyValue(sub({ status: 'Trial' }), plans)).toBe(0);
    expect(monthlyValue(sub({ status: 'Cancelled' }), plans)).toBe(0);
  });

  test('MRR adds the monthly values, ARR is twelve times MRR', () => {
    const list = [sub(), sub({ id: 'L1', plan: 'plus', billing: 'Monthly' }), sub({ id: 'T', status: 'Trial' })];
    expect(mrr(list, plans)).toBe(1_225_000);
    expect(arr(list, plans)).toBe(14_700_000);
  });

  test('net recurring revenue adds upgrades and takes off downgrades and cancellations', () => {
    expect(netRecurring({ base: 468_750_000, upgrades: 24_000_000, downgrades: 6_250_000, cancellations: 10_500_000 })).toBe(476_000_000);
  });
});

describe('plan changes', () => {
  test('an upgrade mid-cycle charges the difference for the days left', () => {
    const r = changePlan(sub({ plan: 'standard', billing: 'Monthly', start: '2026-10-01', nextRenewal: '2026-10-31' }), 'premium', plans, '2026-10-16');
    expect(r.kind).toBe('Upgrade');
    expect(r.proration).toBe(350_000);
    expect(r.sub.plan).toBe('premium');
  });

  test('a downgrade gives a credit, and the same plan is refused', () => {
    const r = changePlan(sub({ plan: 'premium', billing: 'Monthly', start: '2026-10-01', nextRenewal: '2026-10-31' }), 'basic', plans, '2026-10-16');
    expect(r.kind).toBe('Downgrade');
    expect(r.proration).toBe(-475_000);
    expect(changePlan(sub(), 'premium', plans, '2026-10-16').error).toMatch(/already/i);
  });

  test('cancelling needs a reason and ends at the period end', () => {
    expect(cancel(sub(), '', '2026-10-26').error).toMatch(/reason/i);
    const r = cancel(sub(), 'School merged', '2026-10-26');
    expect(r.sub).toMatchObject({ status: 'Cancelled', endsOn: '2027-01-15', cancelReason: 'School merged' });
  });
});

describe('renewals and failed payments', () => {
  test('lists renewals in the next 30 days', () => {
    const list = [sub({ id: 'a', nextRenewal: '2026-11-10' }), sub({ id: 'b', nextRenewal: '2027-01-15' }), sub({ id: 'c', nextRenewal: '2026-11-20', status: 'Cancelled' })];
    expect(renewalsDue(list, '2026-10-26', 30).map((s) => s.id)).toEqual(['a']);
  });

  test('the recovery workflow retries on days 1, 3 and 7, then suspends', () => {
    expect(dunningStep(0)).toEqual({ action: 'Retry', inDays: 1 });
    expect(dunningStep(1)).toEqual({ action: 'Retry', inDays: 3 });
    expect(dunningStep(2)).toEqual({ action: 'Retry', inDays: 7 });
    expect(dunningStep(3)).toEqual({ action: 'Suspend', inDays: 0 });
    expect(recoverPayment(sub({ status: 'Past Due', failedAttempts: 2 }))).toMatchObject({ status: 'Active', failedAttempts: 0 });
  });
});

describe('accounting', () => {
  test('a charge, its collection and monthly recognition post balanced entries', () => {
    const e = chargeEntries('charge', 14_400_000);
    expect(e).toEqual([
      { account: '1200 Accounts Receivable', debit: 14_400_000, credit: 0 },
      { account: '2400 Deferred Revenue', debit: 0, credit: 14_400_000 },
    ]);
    expect(chargeEntries('collect', 100)[0].account).toBe('1100 Bank');
    expect(chargeEntries('recognise', 100)[1].account).toBe('4100 Subscription Revenue');
    expect(chargeEntries('refund', 100)[0].account).toBe('2400 Deferred Revenue');
  });
});
