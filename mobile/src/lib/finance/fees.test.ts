import { financeSchools, formatMoney, formatMoneyCompact, invoiceStatusLabel, newIdempotencyKey } from './fees';

describe('formatMoney', () => {
  it('shows whole shillings with separators', () => {
    expect(formatMoney(650000, 'UGX')).toBe('UGX 650,000');
    expect(formatMoney(0, 'UGX')).toBe('UGX 0');
  });
});

describe('financeSchools', () => {
  it('lists schools where the person runs fees', () => {
    const memberships = [
      { institution_id: 1, institution_name: 'Hill School', role: 'headteacher', status: 'active' },
      { institution_id: 2, institution_name: 'Lake School', role: 'registrar', status: 'active' },
      { institution_id: 3, institution_name: 'Old School', role: 'deputy', status: 'suspended' },
      { institution_id: 4, institution_name: 'Valley School', role: 'subject_teacher', status: 'active' },
    ];
    expect(financeSchools(memberships)).toEqual([
      { id: 1, name: 'Hill School' },
      { id: 2, name: 'Lake School' },
    ]);
  });
});

describe('newIdempotencyKey', () => {
  it('is different every time', () => {
    const keys = new Set(Array.from({ length: 50 }, () => newIdempotencyKey()));
    expect(keys.size).toBe(50);
    expect([...keys][0].length).toBeLessThanOrEqual(100);
  });
});

describe('invoiceStatusLabel', () => {
  it('reads plainly', () => {
    expect(invoiceStatusLabel('partially_paid')).toBe('Part paid');
    expect(invoiceStatusLabel('void')).toBe('Cancelled');
  });
});

describe('formatMoneyCompact', () => {
  test('shortens billions, millions and thousands', () => {
    expect(formatMoneyCompact(7_100_000_000, 'UGX')).toBe('UGX 7.1B');
    expect(formatMoneyCompact(2_900_000_000, 'UGX')).toBe('UGX 2.9B');
    expect(formatMoneyCompact(4_830_000, 'UGX')).toBe('UGX 4.83M');
    expect(formatMoneyCompact(420_000, 'UGX')).toBe('UGX 420K');
  });
  test('keeps small amounts exact', () => {
    expect(formatMoneyCompact(9_500, 'UGX')).toBe('UGX 9,500');
  });
});
