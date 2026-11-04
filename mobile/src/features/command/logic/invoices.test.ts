import { canIssue, formatMoney, type Invoice, invoiceStatus, invoiceTotals, issueCreditNote, nextInvoiceNumber, paymentLink, recordPayment, sendReminder } from './invoices';

const inv = (over: Partial<Invoice> = {}): Invoice => ({
  id: 'i1',
  number: 'INV-20261025-003',
  type: 'Institution',
  customer: 'Bright Future School',
  currency: 'UGX',
  issueDate: '2026-10-25',
  dueDate: '2026-11-08',
  lines: [
    { description: 'Secondary Tuition', qty: 100, unitPrice: 150_000 },
    { description: 'LMS Access (Per Student)', qty: 100, unitPrice: 25_000 },
    { description: 'Exam Preparation Pack', qty: 50, unitPrice: 25_000 },
  ],
  discount: 0,
  taxRate: 0,
  payments: [],
  credits: [],
  audit: [],
  ...over,
});

describe('invoice totals', () => {
  test('adds the lines, takes the discount off, then adds tax', () => {
    expect(invoiceTotals(inv())).toMatchObject({ subtotal: 18_750_000, tax: 0, total: 18_750_000, balance: 18_750_000 });
    const t = invoiceTotals(inv({ discount: 750_000, taxRate: 0.18 }));
    expect(t).toMatchObject({ subtotal: 18_750_000, discount: 750_000, tax: 3_240_000, total: 21_240_000 });
  });

  test('payments and credit notes bring the balance down', () => {
    const t = invoiceTotals(inv({ payments: [{ id: 'p1', amount: 8_750_000, date: '2026-10-28', method: 'Bank Transfer', receipt: 'RCT-1' }], credits: [{ id: 'c1', number: 'CN-1', amount: 1_000_000, reason: 'Ten learners withdrew', date: '2026-10-29' }] }));
    expect(t).toMatchObject({ paid: 8_750_000, credited: 1_000_000, balance: 9_000_000 });
  });

  test('rounds to whole shillings, and to cents in dollars', () => {
    expect(invoiceTotals(inv({ lines: [{ description: 'Subject', qty: 1, unitPrice: 99_999 }], taxRate: 0.18 })).tax).toBe(18_000);
    expect(invoiceTotals(inv({ currency: 'USD', lines: [{ description: 'Subject', qty: 1, unitPrice: 49.99 }], taxRate: 0.18 })).tax).toBe(9);
  });
});

describe('invoice status', () => {
  test('pending before the due date, overdue after it, paid when settled', () => {
    expect(invoiceStatus(inv(), '2026-10-26')).toBe('Pending');
    expect(invoiceStatus(inv(), '2026-11-09')).toBe('Overdue');
    expect(invoiceStatus(inv({ payments: [{ id: 'p1', amount: 18_750_000, date: '2026-10-28', method: 'Card', receipt: 'RCT-1' }] }), '2026-11-09')).toBe('Paid');
  });

  test('part paid and draft', () => {
    expect(invoiceStatus(inv({ payments: [{ id: 'p1', amount: 1_000, date: '2026-10-28', method: 'Card', receipt: 'RCT-1' }] }), '2026-10-26')).toBe('Partially Paid');
    expect(invoiceStatus(inv({ draft: true }), '2026-12-01')).toBe('Draft');
  });
});

describe('payments', () => {
  test('a payment issues a receipt and is logged', () => {
    const r = recordPayment(inv(), { amount: 8_750_000, date: '2026-10-28', method: 'Mobile Money', by: 'Mary N.' });
    expect(r.error).toBeUndefined();
    expect(r.invoice.payments[0]).toMatchObject({ amount: 8_750_000, receipt: 'RCT-20261025-003-1' });
    expect(r.invoice.audit[0]).toMatchObject({ by: 'Mary N.', action: 'Payment of UGX 8,750,000 recorded (Mobile Money)' });
  });

  test('refuses nothing, too much, or a draft', () => {
    expect(recordPayment(inv(), { amount: 0, date: '2026-10-28', method: 'Card', by: 'M' }).error).toMatch(/more than zero/i);
    expect(recordPayment(inv(), { amount: 20_000_000, date: '2026-10-28', method: 'Card', by: 'M' }).error).toMatch(/balance/i);
    expect(recordPayment(inv({ draft: true }), { amount: 10, date: '2026-10-28', method: 'Card', by: 'M' }).error).toMatch(/draft/i);
  });
});

describe('credit notes', () => {
  test('need a reason and cannot exceed the balance', () => {
    expect(issueCreditNote(inv(), { amount: 1_000_000, reason: '', date: '2026-10-29', by: 'M' }).error).toMatch(/reason/i);
    expect(issueCreditNote(inv(), { amount: 99_000_000, reason: 'Withdrawn', date: '2026-10-29', by: 'M' }).error).toMatch(/balance/i);
    const r = issueCreditNote(inv(), { amount: 1_000_000, reason: 'Ten learners withdrew', date: '2026-10-29', by: 'M' });
    expect(r.invoice.credits[0]).toMatchObject({ number: 'CN-20261025-003-1', amount: 1_000_000 });
  });
});

describe('reminders', () => {
  test('say how late the invoice is, and stop once it is paid', () => {
    const r = sendReminder(inv(), '2026-11-11', 'Mary N.');
    expect(r.message).toMatch(/3 days overdue/);
    expect(r.invoice.audit[0].action).toMatch(/Reminder sent/);
    const paid = inv({ payments: [{ id: 'p1', amount: 18_750_000, date: '2026-10-28', method: 'Card', receipt: 'RCT-1' }] });
    expect(sendReminder(paid, '2026-11-11', 'M').error).toMatch(/paid/i);
  });
});

describe('numbering and issuing', () => {
  test('numbers are unique per day', () => {
    expect(nextInvoiceNumber(['INV-20261025-003', 'INV-20261025-001', 'INV-20261024-007'], '2026-10-25')).toBe('INV-20261025-004');
    expect(nextInvoiceNumber([], '2026-10-26')).toBe('INV-20261026-001');
  });

  test('a learner under 18 is billed to a verified guardian', () => {
    const learner = inv({ type: 'Student', customer: 'Amina Namuburu', learnerAge: 14 });
    expect(canIssue(learner).ok).toBe(false);
    expect(canIssue({ ...learner, guardian: { name: 'Sarah Namuburu', verified: true } }).ok).toBe(true);
    expect(canIssue({ ...learner, learnerAge: 19 }).ok).toBe(true);
  });

  test('payment links and money in several currencies', () => {
    expect(paymentLink(inv())).toBe('https://pay.maple.school/i/INV-20261025-003');
    expect(formatMoney(18_750_000, 'UGX')).toBe('UGX 18,750,000');
    expect(formatMoney(49.9, 'USD')).toBe('USD 49.90');
  });
});
