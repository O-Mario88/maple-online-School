import { MAX_MESSAGE, moderate, rankMembers } from './squad';

describe('moderate', () => {
  it('lets ordinary study talk through, maths included', () => {
    expect(moderate('Solve 3(x - 2) = 2x + 7, then check with x = 13')).toEqual({ ok: true, text: 'Solve 3(x - 2) = 2x + 7, then check with x = 13' });
    expect(moderate('We have done 68/100 questions!').ok).toBe(true);
  });

  it('trims the message and refuses an empty one', () => {
    expect(moderate('  hi  ')).toEqual({ ok: true, text: 'hi' });
    expect(moderate('   ').ok).toBe(false);
  });

  it('holds back phone numbers and email addresses', () => {
    expect(moderate('call me on +256 772 123 456')).toEqual({ ok: false, reason: 'contact' });
    expect(moderate('0772123456')).toEqual({ ok: false, reason: 'contact' });
    expect(moderate('mail me at amina@example.com')).toEqual({ ok: false, reason: 'contact' });
  });

  it('sends links to Shared Resources instead of the chat', () => {
    expect(moderate('look at https://example.com/x')).toEqual({ ok: false, reason: 'link' });
    expect(moderate('see www.answers.co')).toEqual({ ok: false, reason: 'link' });
  });

  it('blocks unkind words, whatever the case', () => {
    expect(moderate('you are so STUPID')).toEqual({ ok: false, reason: 'unkind' });
    expect(moderate('Shut up')).toEqual({ ok: false, reason: 'unkind' });
  });

  it('refuses messages that are too long', () => {
    expect(moderate('a'.repeat(MAX_MESSAGE + 1))).toEqual({ ok: false, reason: 'long' });
  });
});

describe('rankMembers', () => {
  const people = [
    { id: 'a', name: 'Aisha', scores: { week: 12, month: 40 } },
    { id: 'd', name: 'Daniel', scores: { week: 18, month: 35 } },
    { id: 'g', name: 'Grace', scores: { week: 28, month: 51 } },
    { id: 'j', name: 'James', scores: { week: 12, month: 44 } },
  ];

  it('orders by the period score, ties by name, numbering from 1', () => {
    expect(rankMembers(people, 'week').map((r) => [r.rank, r.id, r.score])).toEqual([
      [1, 'g', 28],
      [2, 'd', 18],
      [3, 'a', 12],
      [4, 'j', 12],
    ]);
  });

  it('reorders for the month', () => {
    expect(rankMembers(people, 'month').map((r) => r.id)).toEqual(['g', 'j', 'a', 'd']);
  });
});
