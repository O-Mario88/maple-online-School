import { addNote, type BookShape, chapterAt, chapterDone, clock, goTo, gradeQuiz, lookUp, nextTextSize, progressPct, type ReadingState, startReading, syncPayload, toggleBookmark, toggleHighlight } from './reader';

const book: BookShape = {
  id: 'our-environment',
  pages: 56,
  offline: true,
  chapters: [
    { id: 'c1', title: 'Understanding Our Environment', start: 12 },
    { id: 'c2', title: 'Natural Resources', start: 19 },
    { id: 'c3', title: 'Environmental Conservation', start: 26 },
  ],
};

const state = (over: Partial<ReadingState> = {}): ReadingState => ({ ...startReading(book, { lastPage: 12, read: [12, 13] }), ...over });

describe('moving through the book', () => {
  test('starts where the learner left off', () => {
    expect(startReading(book, { lastPage: 12, read: [] }).page).toBe(12);
    expect(startReading(book, undefined).page).toBe(1);
  });

  test('pages stay inside the book and count as read', () => {
    expect(goTo(book, state(), 99).page).toBe(56);
    expect(goTo(book, state(), 0).page).toBe(1);
    const s = goTo(book, state(), 14);
    expect(s.read).toEqual([12, 13, 14]);
    expect(goTo(book, s, 13).read).toEqual([12, 13, 14]);
  });

  test('knows the chapter of any page', () => {
    expect(chapterAt(book, 12)?.id).toBe('c1');
    expect(chapterAt(book, 25)?.id).toBe('c2');
    expect(chapterAt(book, 3)).toBeNull();
  });

  test('a chapter is done once every page in it is read', () => {
    const read = { ...state(), read: [12, 13, 14, 15, 16, 17, 18] };
    expect(chapterDone(book, read, 'c1')).toBe(true);
    expect(chapterDone(book, state(), 'c1')).toBe(false);
    expect(chapterDone(book, { ...state(), read: [26, 27] }, 'c3')).toBe(false);
  });

  test('progress is the share of pages read', () => {
    expect(progressPct(book, { ...state(), read: Array.from({ length: 38 }, (_, i) => i + 1) })).toBe(68);
  });
});

describe('bookmarks, highlights and notes', () => {
  test('bookmarks and highlights toggle', () => {
    const s = toggleBookmark(state(), 12);
    expect(s.bookmarks).toEqual([12]);
    expect(toggleBookmark(s, 12).bookmarks).toEqual([]);
    const h = toggleHighlight(state(), { page: 12, block: 'p1', text: 'Our environment is everything around us.' });
    expect(h.highlights).toHaveLength(1);
    expect(toggleHighlight(h, { page: 12, block: 'p1', text: 'x' }).highlights).toHaveLength(0);
  });

  test('a note needs words', () => {
    expect(addNote(state(), 12, '  ').error).toMatch(/write/i);
    expect(addNote(state(), 12, 'Living and non-living things').state.notes[0]).toMatchObject({ page: 12, text: 'Living and non-living things' });
  });
});

describe('reading tools', () => {
  test('text size steps between the smallest and largest', () => {
    expect(nextTextSize(16, 1)).toBe(18);
    expect(nextTextSize(22, 1)).toBe(22);
    expect(nextTextSize(14, -1)).toBe(14);
  });

  test('read-aloud clock', () => {
    expect(clock(168)).toBe('2:48');
    expect(clock(390)).toBe('6:30');
  });

  test('the dictionary ignores case and punctuation', () => {
    const dict = { environment: 'Everything around us.' };
    expect(lookUp('Environment,', dict)).toBe('Everything around us.');
    expect(lookUp('zebra', dict)).toBeNull();
  });

  test('quizzes are marked, with a pass at 60%', () => {
    const qs = [
      { id: 'q1', answer: 1 },
      { id: 'q2', answer: 0 },
      { id: 'q3', answer: 2 },
      { id: 'q4', answer: 1 },
      { id: 'q5', answer: 3 },
    ];
    expect(gradeQuiz(qs, { q1: 1, q2: 0, q3: 2, q4: 0 })).toEqual({ score: 3, total: 5, pct: 60, passed: true, unanswered: 1 });
    expect(gradeQuiz(qs, { q1: 0 }).passed).toBe(false);
  });
});

describe('sync', () => {
  test('progress goes to the learner dashboard and the parent portal', () => {
    const s = goTo(book, state(), 14);
    expect(syncPayload(book, s, 'learner-amina')).toEqual({ learner: 'learner-amina', bookId: 'our-environment', lastPage: 14, progress: 5, chapter: 'Understanding Our Environment', bookmarks: 0, highlights: 0, notes: 0, targets: ['learner-dashboard', 'parent-portal'] });
  });
});
