import { approvePayout, type Batch, MAX_ATTEMPTS, needsTwo, type Payout, reconcile, retryJob, split, summarise } from './finance';

const batch = (over: Partial<Batch> = {}): Batch => ({ id: 'ST-1', gross: 485200000, fees: 14556000, escrow: 346220000, maple: 124424000, status: 'Settling', ...over });

describe('reconcile', () => {
  test('a batch balances when gross minus fees equals escrow plus Maple revenue', () => {
    const r = reconcile(batch());
    expect(r.balanced).toBe(true);
    expect(r.batch.status).toBe('Settled');
  });

  test('an unbalanced batch is held as a mismatch with the difference', () => {
    const r = reconcile(batch({ maple: 124000000 }));
    expect(r.balanced).toBe(false);
    expect(r.diff).toBe(424000);
    expect(r.batch.status).toBe('Mismatch');
  });
});

describe('split', () => {
  test('marketplace sales pay Maple its commission after processing fees', () => {
    expect(split(1000000, 30000, 0.25, false)).toEqual({ escrow: 727500, maple: 242500 });
  });

  test('BYOS sales (bring your own school) carry no commission', () => {
    expect(split(1000000, 30000, 0.25, true)).toEqual({ escrow: 970000, maple: 0 });
  });
});

describe('summarise', () => {
  test('net revenue is gross minus fees minus teacher escrow', () => {
    const s = summarise([batch(), batch({ id: 'B', gross: 100, fees: 10, escrow: 60, maple: 30 })]);
    expect(s.gross).toBe(485200100);
    expect(s.net).toBe(s.gross - s.fees - s.escrow);
    expect(s.net).toBe(124424030);
  });
});

const payout = (over: Partial<Payout> = {}): Payout => ({ id: 'P1', teacher: 'Sarah Namubiru', amount: 3250000, risk: 'High', approvals: [], status: 'Pending', ...over });

describe('payout approvals', () => {
  test('high-value or high-risk payouts need two approvals', () => {
    expect(needsTwo(payout())).toBe(true);
    expect(needsTwo(payout({ amount: 950000, risk: 'Low' }))).toBe(false);
    expect(needsTwo(payout({ amount: 950000, risk: 'High' }))).toBe(true);
  });

  test('a single-approval payout is approved at once', () => {
    expect(approvePayout(payout({ amount: 950000, risk: 'Low' }), 'Mary N.').payout.status).toBe('Approved');
  });

  test('the second approval must come from a different admin', () => {
    const first = approvePayout(payout(), 'Mary N.').payout;
    expect(first.status).toBe('Awaiting 2nd');
    expect(approvePayout(first, 'Mary N.').error).toMatch(/different admin/i);
    expect(approvePayout(first, 'James K.').payout.status).toBe('Approved');
  });
});

describe('retryJob', () => {
  test('waits longer after each failed attempt', () => {
    const r1 = retryJob({ id: 'T1', attempts: 1 });
    const r2 = retryJob({ id: 'T1', attempts: 2 });
    expect(r1.status).toBe('Scheduled');
    expect(r2.waitMinutes).toBeGreaterThan(r1.waitMinutes);
  });

  test('stops retrying after the last attempt and asks for manual review', () => {
    expect(retryJob({ id: 'T1', attempts: MAX_ATTEMPTS }).status).toBe('Manual Review');
  });
});
