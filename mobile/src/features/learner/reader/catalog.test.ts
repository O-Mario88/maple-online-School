import { buildReaderBook, kindOf, layoutChapters, type Outline, savedProgress, stableSeed, withTopics } from './catalog';

const outline: Outline = {
  about: 'Numbers, fractions and measurement for Primary 6.',
  keyIdeaTranslations: [{ language: 'Luganda', text: 'Ebibalo bituyamba.' }],
  units: [
    {
      title: 'Numbers',
      chapters: [
        { title: 'Whole Numbers', summary: 'Place value up to millions.', keyIdea: 'Every digit has a place value.', points: ['Ones, tens, hundreds', 'Rounding', 'Comparing'] },
        { title: 'Fractions', summary: 'Parts of a whole.', keyIdea: 'A fraction is part of a whole.', points: ['Numerator', 'Denominator', 'Equivalent fractions'] },
      ],
    },
    { title: 'Measurement', chapters: [{ title: 'Length and Mass', summary: 'Metres and kilograms.', keyIdea: 'Measure with standard units.', points: ['Metres', 'Grams', 'Converting'] }] },
  ],
  quiz: [
    { id: 'q1', q: 'What is 1/2 + 1/2?', options: ['1', '2', '1/4', '0'], answer: 0 },
    { id: 'q2', q: 'Place value of 5 in 352?', options: ['Ones', 'Tens', 'Hundreds', 'Thousands'], answer: 1 },
  ],
  dictionary: { fraction: 'A part of a whole.' },
  activity: { title: 'Fraction Hunt', steps: ['Find halves at home.'] },
  tutor: 'Start from the place value chart.',
  related: [{ title: 'Fractions in 5 minutes', meta: 'Video • 5 min', kind: 'video' }],
};

const shelf = (over: Partial<Parameters<typeof buildReaderBook>[0]> = {}) => ({ id: 'fractions', title: 'Fractions and Decimals', subject: 'Mathematics', level: 'Primary 6', type: 'E-books', rating: 4.8, cover: 7, publisher: 'Maple', ...over });

describe('resource kinds', () => {
  test('library types map to reader kinds', () => {
    expect(kindOf('E-books')).toBe('book');
    expect(kindOf('Videos')).toBe('video');
    expect(kindOf('Audiobooks')).toBe('audio');
    expect(kindOf('Practice Papers')).toBe('paper');
    expect(kindOf('Teacher Guides')).toBe('guide');
    expect(kindOf('Flashcards')).toBe('cards');
    expect(kindOf('Articles')).toBe('article');
  });
});

describe('layout', () => {
  test('chapters follow the front matter, spaced through the book', () => {
    expect(layoutChapters(['A', 'B', 'C'], 30, 3)).toEqual([
      { id: 'c1', title: 'A', start: 4 },
      { id: 'c2', title: 'B', start: 13 },
      { id: 'c3', title: 'C', start: 22 },
    ]);
  });

  test('the seed and saved place are the same every time for a book', () => {
    expect(stableSeed('fractions')).toBe(stableSeed('fractions'));
    expect(stableSeed('fractions')).not.toBe(stableSeed('our-uganda'));
    const a = savedProgress('fractions', 40, 4);
    expect(a).toEqual(savedProgress('fractions', 40, 4));
    expect(a.read).toEqual(Array.from({ length: a.read.length }, (_, i) => i + 1));
    expect(a.lastPage).toBe(Math.max(1, a.read.length));
    expect(a.read.length).toBeGreaterThanOrEqual(4);
    expect(a.read.length).toBeLessThanOrEqual(32);
  });
});

describe('building a reader book', () => {
  test('an e-book gets units, chapters, a written page per chapter start and the subject tools', () => {
    const r = buildReaderBook(shelf(), outline);
    expect(r.book).toMatchObject({ id: 'fractions', title: 'Fractions and Decimals', format: 'eBook', kind: 'book', unit: 'page' });
    expect(r.units.map((u) => u.title)).toEqual(['Unit 1: Numbers', 'Unit 2: Measurement']);
    expect(r.book.chapters.map((c) => c.title)).toEqual(['Whole Numbers', 'Fractions', 'Length and Mass']);
    const first = r.book.chapters[0].start;
    expect(r.spreads[first].left[0]).toEqual({ kind: 'tag', text: 'Chapter 1' });
    expect(r.spreads[first].right.some((b) => b.kind === 'figure')).toBe(true);
    expect(r.quickQuestions).toHaveLength(2);
    expect(r.dictionary.fraction).toBe('A part of a whole.');
    expect(r.book.about).toMatch(/^Fractions and Decimals:/);
  });

  test('a video plays in parts, with the player on each part', () => {
    const r = buildReaderBook(shelf({ id: 'solar-system', type: 'Videos', title: 'The Solar System' }), outline);
    expect(r.book).toMatchObject({ kind: 'video', format: 'Video', unit: 'part', pages: 3 });
    expect(r.spreads[1].left[0]).toMatchObject({ kind: 'media', media: 'video' });
  });

  test('an audiobook plays in tracks', () => {
    const r = buildReaderBook(shelf({ id: 'bible-stories', type: 'Audiobooks' }), outline);
    expect(r.book).toMatchObject({ kind: 'audio', format: 'Audiobook', unit: 'track' });
  });
});

describe('book-specific chapters', () => {
  test('a book with its own topics keeps the subject tools but uses its chapter titles', () => {
    const o = withTopics(outline, ['The Sun', 'The Planets', 'The Moon', 'Exploring Space']);
    expect(o.units.map((u) => u.chapters.map((c) => c.title))).toEqual([
      ['The Sun', 'The Planets'],
      ['The Moon', 'Exploring Space'],
    ]);
    expect(o.units[0].chapters[0].summary).toMatch(/the sun/i);
    expect(o.quiz).toBe(outline.quiz);
    expect(withTopics(outline, [])).toBe(outline);
  });
});
