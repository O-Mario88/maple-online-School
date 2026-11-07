import { exportFileName, studentBalances } from './ledger';
import type { Invoice } from './fees';

const invoice = (id: number, student: number, name: string, total: number, paid: number, status: Invoice['status'] = 'issued'): Invoice => ({
  id,
  school: 1,
  student,
  student_name: name,
  term: null,
  class: null,
  number: `INV-${id}`,
  currency: 'UGX',
  total_minor: total,
  paid_minor: paid,
  balance_minor: total - paid,
  status,
  due_date: null,
  created_at: '2026-09-01T08:00:00Z',
  lines: [],
});

describe('studentBalances', () => {
  it('totals each learner’s invoices, most owed first, and leaves voided invoices out', () => {
    const rows = studentBalances([
      invoice(1, 7, 'Amani', 500_000, 200_000, 'partially_paid'),
      invoice(2, 7, 'Amani', 100_000, 0),
      invoice(3, 8, 'Zawadi', 300_000, 300_000, 'paid'),
      invoice(4, 8, 'Zawadi', 900_000, 0, 'void'),
      invoice(5, 9, 'Baraka', 50_000, 0),
    ]);
    expect(rows.map((r) => [r.name, r.billed, r.paid, r.balance, r.invoices.length])).toEqual([
      ['Amani', 600_000, 200_000, 400_000, 2],
      ['Baraka', 50_000, 0, 50_000, 1],
      ['Zawadi', 300_000, 300_000, 0, 1],
    ]);
  });
});

describe('exportFileName', () => {
  it('names the CSV after the school and the day, safe for any file system', () => {
    expect(exportFileName('St. Mary’s Kitende', new Date(2026, 10, 3))).toBe('st-mary-s-kitende-journal-2026-11-03.csv');
  });
});
