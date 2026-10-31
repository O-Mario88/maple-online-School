import { deckProgress, filterBooks, nextCard } from './shelf';

const b = (id: string, over: Partial<{ subject: string; level: string; type: string; language: string; publisher: string; title: string }> = {}) => ({
  id,
  title: id,
  subject: 'Mathematics',
  level: 'Primary 6',
  type: 'E-books',
  language: 'English',
  publisher: 'Maple',
  ...over,
});
const books = [
  b('maths'),
  b('english', { subject: 'English', title: 'English for Primary 6' }),
  b('luganda', { subject: 'Languages', language: 'Luganda', publisher: 'Fountain' }),
  b('video', { type: 'Videos', level: 'Primary 7' }),
];

describe('filterBooks', () => {
  it('keeps everything with no filters', () => {
    expect(filterBooks(books, {})).toHaveLength(4);
  });

  it('filters by subject, level and search words', () => {
    expect(filterBooks(books, { subject: 'English' }).map((x) => x.id)).toEqual(['english']);
    expect(filterBooks(books, { level: 'Primary 7' }).map((x) => x.id)).toEqual(['video']);
    expect(filterBooks(books, { query: 'primary 6' }).map((x) => x.id)).toEqual(['english']);
  });

  it('matches any ticked type, language or publisher', () => {
    expect(filterBooks(books, { types: ['Videos'] }).map((x) => x.id)).toEqual(['video']);
    expect(filterBooks(books, { languages: ['Luganda', 'English'] })).toHaveLength(4);
    expect(filterBooks(books, { publishers: ['Fountain'] }).map((x) => x.id)).toEqual(['luganda']);
  });
});

describe('deckProgress', () => {
  it('counts Good and Easy fully and Hard as half', () => {
    const ratings = { ...Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i, 'good'])), 12: 'hard', 13: 'hard', 14: 'hard', 15: 'again' } as const;
    expect(deckProgress(ratings, 48)).toBe(28);
  });

  it('is 0 for an empty deck', () => {
    expect(deckProgress({}, 0)).toBe(0);
  });
});

describe('nextCard', () => {
  it('moves through the deck and wraps around', () => {
    expect(nextCard(0, 1, 48)).toBe(1);
    expect(nextCard(47, 1, 48)).toBe(0);
    expect(nextCard(0, -1, 48)).toBe(47);
  });
});
