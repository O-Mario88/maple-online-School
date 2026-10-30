import { financeSchools, formatMoney, invoiceStatusLabel, newIdempotencyKey } from './fees';

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
