import { type Batch, expected, matchDeposit, providerShare, reconStatus, reconSummary, recordManual, refund, resolveDifference, type Txn, txnSummary, variance } from './payments';

const txn = (over: Partial<Txn> = {}): Txn => ({ id: 'TRX-1', at: '2026-10-31T09:14', customer: 'Green Valley School', type: 'Subscription', provider: 'Stripe', amount: 1_200_000, status: 'Successful', refunded: 0, ...over });

describe('transactions', () => {
  const list = [txn(), txn({ id: 'b', provider: 'Paystack', amount: 50_000 }), txn({ id: 'c', status: 'Pending', amount: 2_500_000 }), txn({ id: 'd', status: 'Failed', amount: 30_000 }), txn({ id: 'e', status: 'Refunded', amount: 1_000_000, refunded: 1_000_000 })];

  test('summarises value, success rate and each status', () => {
    expect(txnSummary(list)).toEqual({ value: 4_750_000, count: 5, successful: 2, successRate: 40, pending: 1, failed: 1, refunded: 1, refundedValue: 1_000_000, chargebacks: 0, chargebackValue: 0 });
  });

  test('shares by provider, largest first, from successful payments', () => {
    expect(providerShare(list).map((p) => [p.provider, p.value, p.pct])).toEqual([
      ['Stripe', 1_200_000, 96],
      ['Paystack', 50_000, 4],
    ]);
  });

  test('refunds: only successful payments, no more than what is left', () => {
    expect(refund(txn({ status: 'Pending' }), 100, 'x').error).toMatch(/successful/i);
    expect(refund(txn(), 2_000_000, 'Double charge').error).toMatch(/more than/i);
    expect(refund(txn(), 100, '').error).toMatch(/reason/i);
    expect(refund(txn(), 200_000, 'Class cancelled').txn).toMatchObject({ status: 'Successful', refunded: 200_000 });
    expect(refund(txn(), 1_200_000, 'Duplicate').txn.status).toBe('Refunded');
  });

  test('a manual payment needs a new reference and an amount', () => {
    expect(recordManual(list, { reference: 'TRX-1', amount: 100, customer: 'A', provider: 'Bank Transfer', at: 'now' }).error).toMatch(/already/i);
    expect(recordManual(list, { reference: 'BNK-9', amount: 0, customer: 'A', provider: 'Bank Transfer', at: 'now' }).error).toMatch(/amount/i);
    const r = recordManual(list, { reference: 'BNK-9', amount: 450_000, customer: 'Hope Primary', provider: 'Bank Transfer', at: 'now' });
    expect(r.list[0]).toMatchObject({ id: 'BNK-9', status: 'Successful', manual: true });
  });
});

const batch = (over: Partial<Batch> = {}): Batch => ({ id: 'MM-20261027-009', provider: 'MTN MoMo', gross: 370_000_000, fees: 5_920_000, refunds: 3_000_000, deposit: 356_480_000, ...over });

describe('settlements', () => {
  test('expected settlement is gross less fees and refunds; variance is the deposit against it', () => {
    expect(expected(batch())).toBe(361_080_000);
    expect(variance(batch())).toBe(-4_600_000);
  });

  test('status from the variance: within 2% is a difference, beyond it is investigated', () => {
    expect(reconStatus(batch({ deposit: 361_080_000 }))).toBe('Reconciled');
    expect(reconStatus(batch())).toBe('Difference');
    expect(reconStatus(batch({ provider: 'Bank Transfer', gross: 90_000_000, fees: 0, refunds: 0, deposit: 86_400_000 }))).toBe('Investigate');
    expect(reconStatus(batch({ deposit: null }))).toBe('Pending Match');
  });

  test('matching a deposit and resolving a difference', () => {
    expect(reconStatus(matchDeposit(batch({ deposit: null }), 361_080_000))).toBe('Reconciled');
    expect(resolveDifference(batch(), '').error).toMatch(/explain/i);
    const r = resolveDifference(batch(), 'MTN late fee deducted at source');
    expect(r.batch).toMatchObject({ resolved: true, note: 'MTN late fee deducted at source' });
    expect(reconStatus(r.batch)).toBe('Reconciled');
    expect(r.entry).toEqual([
      { account: '6150 Payment Provider Fees', debit: 4_600_000, credit: 0 },
      { account: '1150 Provider Clearing', debit: 0, credit: 4_600_000 },
    ]);
  });

  test('summary of a set of batches: the matched part of each deposit counts as reconciled', () => {
    const s = reconSummary([batch({ deposit: 361_080_000 }), batch({ id: 'b' })]);
    expect(s).toMatchObject({ expected: 722_160_000, deposits: 717_560_000, reconciled: 717_560_000, unreconciled: 4_600_000, exceptions: 1 });
  });

  test('reconciled value never exceeds what was expected', () => {
    expect(reconSummary([batch({ deposit: 400_000_000 })]).reconciled).toBe(361_080_000);
    const resolved = resolveDifference(batch(), 'Fee deducted').batch;
    expect(reconSummary([resolved])).toMatchObject({ reconciled: 361_080_000, unreconciled: 0 });
    expect(reconSummary([batch({ deposit: null })])).toMatchObject({ reconciled: 0, unreconciled: 361_080_000 });
  });
});
