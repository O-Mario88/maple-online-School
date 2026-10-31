import { collectionRate, familyBalance, greeting, humanize } from './home';

describe('greeting', () => {
  it('follows the time of day', () => {
    expect(greeting(new Date(2026, 9, 30, 8))).toBe('Good morning');
    expect(greeting(new Date(2026, 9, 30, 13))).toBe('Good afternoon');
    expect(greeting(new Date(2026, 9, 30, 19))).toBe('Good evening');
  });
});

describe('collectionRate', () => {
  it('is the share of billed fees collected', () => {
    expect(collectionRate({ billed_minor: 400000, collected_minor: 100000 })).toBe(0.25);
  });

  it('is zero before anything is billed', () => {
    expect(collectionRate({ billed_minor: 0, collected_minor: 0 })).toBe(0);
  });
});

describe('familyBalance', () => {
  const invoice = (total: number, paid: number, status = 'issued', currency = 'UGX') => ({
    total_minor: total,
    paid_minor: paid,
    status,
    currency,
  });

  it('adds what is still owed, ignoring void invoices', () => {
    expect(familyBalance([invoice(300000, 100000), invoice(50000, 0), invoice(90000, 0, 'void')])).toEqual([
      { currency: 'UGX', minor: 250000 },
    ]);
  });

  it('keeps currencies apart and drops settled ones', () => {
    expect(familyBalance([invoice(100, 100), invoice(500, 200, 'issued', 'KES')])).toEqual([{ currency: 'KES', minor: 300 }]);
  });
});

describe('humanize', () => {
  it('turns an API word into a label', () => {
    expect(humanize('subject_teacher')).toBe('Subject teacher');
    expect(humanize('mother')).toBe('Mother');
  });
});
