import { CREDIT_MINUTES, needsTopUp, packSaving, planPrice, receiptText, validMobileMoney } from './billing';

describe('planPrice', () => {
  it('charges the monthly price each month', () => {
    expect(planPrice(50000, 'monthly')).toEqual({ total: 50000, months: 1, perMonth: 50000, saving: 0 });
  });

  it('takes 10% off a three-month term and 20% off a year', () => {
    expect(planPrice(50000, 'term')).toEqual({ total: 135000, months: 3, perMonth: 45000, saving: 10 });
    expect(planPrice(20000, 'annual')).toEqual({ total: 192000, months: 12, perMonth: 16000, saving: 20 });
  });
});

describe('packSaving', () => {
  it('compares a pack with buying 5 credits at a time', () => {
    const base = { credits: 5, price: 25000 };
    expect(packSaving({ credits: 10, price: 45000 }, base)).toBe(10);
    expect(packSaving({ credits: 20, price: 80000 }, base)).toBe(20);
    expect(packSaving(base, base)).toBe(0);
  });
});

describe('needsTopUp', () => {
  it('tops up only when on and the balance falls below the threshold', () => {
    expect(needsTopUp(2, { on: true, below: 3 })).toBe(true);
    expect(needsTopUp(3, { on: true, below: 3 })).toBe(false);
    expect(needsTopUp(0, { on: false, below: 3 })).toBe(false);
  });
});

describe('CREDIT_MINUTES', () => {
  it('is 15 minutes of tutoring per credit', () => {
    expect(CREDIT_MINUTES).toBe(15);
  });
});

describe('validMobileMoney', () => {
  it('accepts Ugandan MTN and Airtel numbers in local or international form', () => {
    expect(validMobileMoney('+256 772 123 456', 'mtn')).toBe('+256 772 123 456');
    expect(validMobileMoney('0772123456', 'mtn')).toBe('+256 772 123 456');
    expect(validMobileMoney('0701 987 654', 'airtel')).toBe('+256 701 987 654');
  });

  it('rejects numbers on the other network or of the wrong length', () => {
    expect(validMobileMoney('0701987654', 'mtn')).toBeNull();
    expect(validMobileMoney('077212345', 'mtn')).toBeNull();
    expect(validMobileMoney('hello', 'airtel')).toBeNull();
  });
});

describe('receiptText', () => {
  it('lists the item, amount, date, method and a receipt number', () => {
    const t = receiptText({ id: 'r-1015', title: '10 Tutoring Credits', amount: 45000, date: '10 Oct 2026', method: 'MTN Mobile Money' }, 'Daniel');
    expect(t).toContain('Receipt R-1015');
    expect(t).toContain('10 Tutoring Credits');
    expect(t).toContain('UGX 45,000');
    expect(t).toContain('Paid with MTN Mobile Money on 10 Oct 2026');
  });
});
