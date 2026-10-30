import { bookingQuote, MARKETPLACE_COMMISSION, parseHandle } from './booking';

describe('bookingQuote', () => {
  it('takes no commission when the learner came through the teacher’s own link', () => {
    expect(bookingQuote(25000, 'direct')).toEqual({ priceUGX: 25000, commissionRate: 0, teacherGetsUGX: 25000, direct: true });
  });

  it('takes the marketplace commission otherwise', () => {
    const q = bookingQuote(25000, undefined);
    expect(q.commissionRate).toBe(MARKETPLACE_COMMISSION);
    expect(q.teacherGetsUGX).toBe(25000 - Math.round(25000 * MARKETPLACE_COMMISSION));
    expect(q.direct).toBe(false);
  });

  it('ignores other ref values', () => {
    expect(bookingQuote(25000, 'search').direct).toBe(false);
  });
});

describe('parseHandle', () => {
  it('accepts @handles and returns the handle without the @', () => {
    expect(parseHandle('@sarah-kimani')).toBe('sarah-kimani');
  });

  it('rejects anything else', () => {
    expect(parseHandle('sarah-kimani')).toBeNull();
    expect(parseHandle('@')).toBeNull();
    expect(parseHandle('@bad handle!')).toBeNull();
    expect(parseHandle(undefined)).toBeNull();
  });
});
