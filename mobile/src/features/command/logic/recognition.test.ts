import { cancelItem, monthsElapsed, nextRecognition, recognise, type RevenueItem, rollForward } from './recognition';

const AS_OF = '2026-10-31';
const sub = (over: Partial<RevenueItem> = {}): RevenueItem => ({ id: 'SUB-2026-0143', total: 420_000_000, cash: 420_000_000, method: 'straight', start: '2026-05-01', periods: 12, ...over });

describe('recognising revenue', () => {
  test('counts whole months from the start', () => {
    expect(monthsElapsed('2026-05-01', AS_OF)).toBe(6);
    expect(monthsElapsed('2026-11-01', AS_OF)).toBe(0);
    expect(monthsElapsed('2025-01-01', AS_OF)).toBe(22);
  });

  test('straight-line subscriptions earn evenly over the contract', () => {
    expect(recognise(sub(), AS_OF)).toEqual({ recognized: 210_000_000, deferred: 210_000_000, status: 'Active' });
    expect(recognise(sub({ start: '2025-11-01', total: 180_000_000 }), AS_OF)).toEqual({ recognized: 180_000_000, deferred: 0, status: 'Completed' });
  });

  test('subject access earns over the access weeks; commissions on delivery', () => {
    expect(recognise(sub({ total: 75_000, method: 'access', start: '2026-09-26', periods: 8 }), AS_OF)).toEqual({ recognized: 46_875, deferred: 28_125, status: 'Active' });
    expect(recognise(sub({ total: 1_200_000, method: 'delivery', delivered: true }), AS_OF)).toEqual({ recognized: 1_200_000, deferred: 0, status: 'Recognized' });
    expect(recognise(sub({ method: 'delivery', delivered: false }), AS_OF).recognized).toBe(0);
  });

  test('the next monthly recognition', () => {
    expect(nextRecognition(sub(), AS_OF)).toEqual({ date: '2026-11-01', amount: 35_000_000 });
    expect(nextRecognition(sub({ start: '2025-11-01' }), AS_OF)).toBeNull();
  });

  test('subject access earns weekly; delivered and cancelled items have no next recognition', () => {
    expect(nextRecognition(sub({ total: 75_000, method: 'access', start: '2026-09-26', periods: 8 }), AS_OF)).toEqual({ date: '2026-11-07', amount: 9_375 });
    expect(nextRecognition(sub({ method: 'delivery', delivered: true }), AS_OF)).toBeNull();
    expect(nextRecognition(sub({ cancelled: AS_OF }), AS_OF)).toBeNull();
  });
});

describe('cancellations and the deferred balance', () => {
  test('a cancellation keeps what was earned and reverses the unearned part', () => {
    const r = cancelItem(sub({ total: 100_000_000, cash: 100_000_000, start: '2026-06-01', periods: 12 }), '2026-10-31');
    expect(r).toMatchObject({ earned: 41_666_667, reversed: 58_333_333, status: 'Cancelled' });
    expect(r.entry).toEqual([
      { account: '2400 Deferred Revenue', debit: 58_333_333, credit: 0 },
      { account: '2410 Refunds Payable', debit: 0, credit: 58_333_333 },
    ]);
  });

  test('roll-forward: opening plus prepayments less recognised and cancellations', () => {
    expect(rollForward({ opening: 1_320_400_000, prepayments: 2_186_000_000, recognized: 1_982_750_000, cancellations: 48_000_000 })).toBe(1_475_650_000);
  });
});
