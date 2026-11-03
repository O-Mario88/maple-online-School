import { complianceStatus, type Filing, filingState, fileReturn, resendToEfris, taxBreakdown, taxFor, type TaxTxn, totalWithTax } from './tax';

const txn = (over: Partial<TaxTxn> = {}): TaxTxn => ({ id: 'TXN-20261026-001', date: '2026-10-26', taxable: 12_500_000, taxType: 'VAT', efris: 'Submitted', ...over });

describe('tax amounts', () => {
  test('VAT is 18% and is added to the price', () => {
    expect(taxFor(12_500_000, 'VAT')).toBe(2_250_000);
    expect(totalWithTax(txn())).toBe(14_750_000);
  });

  test('withholding tax is 6% and comes off what Maple receives', () => {
    expect(taxFor(5_000_000, 'WHT')).toBe(300_000);
    expect(totalWithTax(txn({ taxable: 5_000_000, taxType: 'WHT' }))).toBe(4_700_000);
  });

  test('rounds to whole shillings', () => {
    expect(taxFor(180_001, 'VAT')).toBe(32_400);
  });

  test('breaks the month down by tax type, with shares', () => {
    const b = taxBreakdown([txn(), txn({ taxable: 5_000_000, taxType: 'WHT' }), txn({ taxable: 10_000_000, taxType: 'DST' })]);
    expect(b.total).toBe(2_750_000);
    expect(b.rows.map((r) => [r.type, r.amount, r.pct])).toEqual([
      ['VAT', 2_250_000, 81.8],
      ['WHT', 300_000, 10.9],
      ['DST', 200_000, 7.3],
    ]);
  });
});

const filing = (over: Partial<Filing> = {}): Filing => ({ id: 'f1', title: 'VAT Return (Oct 2026)', due: '2026-11-15', done: false, ...over });

describe('filings', () => {
  test('say how long is left, and turn red when close or late', () => {
    expect(filingState(filing(), '2026-10-26')).toEqual({ label: 'Due in 20 days', tone: 'red' });
    expect(filingState(filing({ due: '2026-11-30' }), '2026-10-26')).toEqual({ label: 'Due in 35 days', tone: 'orange' });
    expect(filingState(filing({ due: '2027-01-31' }), '2026-10-26')).toEqual({ label: 'In 97 days', tone: 'blue' });
    expect(filingState(filing({ due: '2026-10-20' }), '2026-10-26')).toEqual({ label: 'Overdue by 6 days', tone: 'red' });
    expect(filingState(filing({ done: true }), '2026-10-26')).toEqual({ label: 'Completed', tone: 'green' });
  });

  test('filing a return marks it done once', () => {
    const r = fileReturn(filing(), '2026-10-26');
    expect(r.filing).toMatchObject({ done: true, filedOn: '2026-10-26' });
    expect(fileReturn(r.filing, '2026-10-27').error).toMatch(/already filed/i);
  });

  test('compliant unless a return is late', () => {
    expect(complianceStatus([filing()], '2026-10-26')).toBe('Compliant');
    expect(complianceStatus([filing({ due: '2026-10-20' })], '2026-10-26')).toBe('Action Needed');
    expect(complianceStatus([filing({ due: '2026-10-20', done: true })], '2026-10-26')).toBe('Compliant');
  });
});

describe('eFRIS', () => {
  test('resending a pending or failed receipt gets a fiscal number', () => {
    const r = resendToEfris(txn({ efris: 'Failed' }), 7782);
    expect(r.txn).toMatchObject({ efris: 'Submitted', efrisReceipt: 'EFRIS-20261026-7782' });
    expect(resendToEfris(txn(), 1).error).toMatch(/already/i);
  });
});
