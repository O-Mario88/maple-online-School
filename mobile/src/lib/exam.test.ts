import { examSimulator } from '@/mock/exam';

import { domainIdentifiers, formatClock, formatPlayback, questionState, tally } from './exam';

describe('formatClock', () => {
  it('shows hours, minutes and seconds with leading zeros', () => {
    expect(formatClock(5325)).toBe('01:28:45');
  });

  it('never shows a negative time', () => {
    expect(formatClock(-4)).toBe('00:00:00');
  });
});

describe('formatPlayback', () => {
  it('shows minutes and two-digit seconds', () => {
    expect(formatPlayback(42)).toBe('0:42');
    expect(formatPlayback(134)).toBe('2:14');
  });
});

describe('questionState', () => {
  const sheet = { current: 14, answers: { 1: 0, 13: 2, 14: 2 }, flagged: [13, 14] };

  it('marks the open question as current, even when flagged', () => {
    expect(questionState(14, sheet)).toBe('current');
  });

  it('shows a flag before an answer', () => {
    expect(questionState(13, sheet)).toBe('flagged');
  });

  it('separates answered from not answered', () => {
    expect(questionState(1, sheet)).toBe('answered');
    expect(questionState(2, sheet)).toBe('unanswered');
  });
});

describe('tally', () => {
  const key = [
    { n: 1, answer: 0 },
    { n: 2, answer: 1 },
    { n: 3, answer: 2 },
  ];

  it('counts correct, incorrect and not answered questions', () => {
    expect(tally(key, { 1: 0, 2: 3 })).toEqual({ correct: 1, incorrect: 1, unanswered: 1, answered: 2 });
  });
});

describe('the sample paper', () => {
  it('gives every question four different options and one right answer', () => {
    for (const q of examSimulator.questions) {
      expect(new Set(q.options).size).toBe(4);
      expect(q.options[q.answer]).toBeDefined();
    }
  });

  it('starts as the reference shows: 12 right, 2 wrong, 26 not answered', () => {
    expect(tally(examSimulator.questions, examSimulator.start.answers)).toEqual({ correct: 12, incorrect: 2, unanswered: 26, answered: 14 });
  });
});

describe('domainIdentifiers', () => {
  const key = [
    { n: 1, answer: 0, domain: 'knowledge' as const },
    { n: 2, answer: 1, domain: 'knowledge' as const },
    { n: 3, answer: 2, domain: 'skills' as const },
    { n: 4, answer: 3, domain: 'skills' as const },
  ];

  it('gives each learning domain an identifier from the questions answered in it', () => {
    expect(domainIdentifiers(key, { 1: 0, 2: 1, 3: 0 })).toEqual({ knowledge: { id: 3, label: 'Outstanding' }, skills: { id: 1, label: 'Basic' } });
  });

  it('leaves a domain empty until a question in it is answered', () => {
    expect(domainIdentifiers(key, { 1: 0 })).toEqual({ knowledge: { id: 3, label: 'Outstanding' }, skills: null });
  });
});

describe('the sample paper domains', () => {
  it('tags every question as knowledge or skills', () => {
    expect(examSimulator.questions.every((q) => q.domain === 'knowledge' || q.domain === 'skills')).toBe(true);
  });
});
