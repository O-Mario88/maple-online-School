import { answeredCount, canSubmit, checklist, parseDoc, parseMath } from './assignment-work';

describe('parseMath', () => {
  it('turns a/b into a stacked fraction and keeps the words around it', () => {
    expect(parseMath('uses 2/3 cup')).toEqual([
      { kind: 'text', text: 'uses' },
      { kind: 'frac', num: '2', den: '3' },
      { kind: 'text', text: 'cup' },
    ]);
  });

  it('keeps punctuation that follows a fraction', () => {
    expect(parseMath('5/18 m.')).toEqual([
      { kind: 'frac', num: '5', den: '18' },
      { kind: 'text', text: 'm.' },
    ]);
    expect(parseMath('using 1/8,')).toEqual([
      { kind: 'text', text: 'using' },
      { kind: 'frac', num: '1', den: '8', after: ',' },
    ]);
  });

  it('stacks single-letter fractions such as a/b', () => {
    expect(parseMath('form a/b where')).toEqual([
      { kind: 'text', text: 'form' },
      { kind: 'frac', num: 'a', den: 'b' },
      { kind: 'text', text: 'where' },
    ]);
  });

  it('marks bold, italic and underlined words', () => {
    expect(parseMath('in **total** and *this* and __that__')).toEqual([
      { kind: 'text', text: 'in' },
      { kind: 'text', text: 'total', bold: true },
      { kind: 'text', text: 'and' },
      { kind: 'text', text: 'this', italic: true },
      { kind: 'text', text: 'and' },
      { kind: 'text', text: 'that', underline: true },
    ]);
  });

  it('closes a mark that is followed by punctuation', () => {
    expect(parseMath('in **total**.')).toEqual([
      { kind: 'text', text: 'in' },
      { kind: 'text', text: 'total.', bold: true },
    ]);
  });

  it('carries a mark across several words', () => {
    expect(parseMath('**2 cups**').map((t) => t.kind === 'text' && t.bold)).toEqual([true, true]);
  });
});

describe('parseDoc', () => {
  it('splits headings from paragraphs and drops blank lines', () => {
    expect(parseDoc('# Question 1\nEach batch\n\nSo')).toEqual([
      { heading: true, text: 'Question 1' },
      { heading: false, text: 'Each batch' },
      { heading: false, text: 'So' },
    ]);
  });
});

describe('answeredCount', () => {
  it('counts question headings that have writing under them', () => {
    expect(answeredCount('# Question 1\nworking\n# Question 2\n\n# Question 3\nmore')).toBe(2);
    expect(answeredCount('')).toBe(0);
  });
});

describe('checklist and canSubmit', () => {
  const ready = { answered: 2, pages: 3, vivaSeconds: 43, submitted: false };

  it('ticks each step from the work done so far', () => {
    expect(checklist(ready).map((c) => c.done)).toEqual([true, true, true, false]);
    expect(checklist({ ...ready, pages: 0 }).map((c) => c.done)).toEqual([true, false, true, false]);
  });

  it('needs a viva of at least 10 seconds', () => {
    expect(checklist({ ...ready, vivaSeconds: 6 })[2].done).toBe(false);
  });

  it('allows submitting once the work is in, and only once', () => {
    expect(canSubmit(ready)).toBe(true);
    expect(canSubmit({ ...ready, answered: 0 })).toBe(false);
    expect(canSubmit({ ...ready, submitted: true })).toBe(false);
  });
});
