import { continueLearning, exploreRows, offeringSize, filterCourses, goalsDone, justForYou, liveNow, type Offering, toggleGoal, upcoming } from './explore';

const o = (over: Partial<Offering>): Offering => ({ id: 'x', title: 'Subject', kind: 'Subjects', curriculum: 'UNEB', subject: 'Mathematics', level: 'S3', rating: 4.8, learners: 100, progress: 0, ...over });
const LIST: readonly Offering[] = [
  o({ id: 'a', title: 'UNEB Maths', subject: 'Mathematics', progress: 0.42, learners: 900 }),
  o({ id: 'b', title: 'KCSE Chemistry', curriculum: 'KCSE', subject: 'Chemistry', learners: 1200 }),
  o({ id: 'c', title: 'UNEB Past Papers', kind: 'Past Papers', subject: 'Biology', learners: 300 }),
  o({ id: 'd', title: 'UNEB Physics', subject: 'Physics', progress: 1, learners: 500 }),
  o({ id: 'e', title: 'UNEB Biology', subject: 'Biology', progress: 0.1, learners: 700 }),
];

describe('finding something to learn', () => {
  test('filters by curriculum, category, subject and search; most popular first', () => {
    expect(filterCourses(LIST, { curriculum: 'UNEB' }).map((x) => x.id)).toEqual(['a', 'e', 'd', 'c']);
    expect(filterCourses(LIST, { curriculum: 'UNEB', kind: 'Past Papers' }).map((x) => x.id)).toEqual(['c']);
    expect(filterCourses(LIST, { subject: 'Biology' }).map((x) => x.id)).toEqual(['e', 'c']);
    expect(filterCourses(LIST, { query: 'chem' }).map((x) => x.id)).toEqual(['b']);
  });

  test('continue learning is what is started and not finished, furthest along first', () => {
    expect(continueLearning(LIST).map((x) => x.id)).toEqual(['a', 'e']);
  });

  test('just for you: same curriculum, not started, weakest subject first', () => {
    expect(justForYou(LIST, 'UNEB', ['Biology', 'Mathematics']).map((x) => x.id)).toEqual(['c']);
  });
});

describe("today's learning", () => {
  const goals = [
    { id: 'g1', label: 'Watch 1 lesson', done: true },
    { id: 'g2', label: 'Practise 10 questions', done: true },
    { id: 'g3', label: 'Join a live class', done: false },
  ];

  test('counts goals and toggles one without changing the others', () => {
    expect(goalsDone(goals)).toEqual({ done: 2, total: 3, pct: 67 });
    const next = toggleGoal(goals, 'g3');
    expect(goalsDone(next).done).toBe(3);
    expect(goals[2].done).toBe(false);
  });

  test('live now and upcoming classes by time', () => {
    const s = [
      { id: 'l1', title: 'Algebra', start: '2026-10-31T10:00', minutes: 60 },
      { id: 'l2', title: 'Genetics', start: '2026-10-31T14:00', minutes: 45 },
      { id: 'l3', title: 'Moles', start: '2026-10-31T08:00', minutes: 60 },
      { id: 'l4', title: 'Essays', start: '2026-11-01T09:00', minutes: 60 },
    ];
    expect(liveNow(s, '2026-10-31T10:30').map((x) => x.id)).toEqual(['l1']);
    expect(upcoming(s, '2026-10-31T10:30').map((x) => x.id)).toEqual(['l2', 'l4']);
  });
});

describe('the rows on Explore', () => {
  const NOW = '2026-10-31T10:30';
  const ROWS: readonly Offering[] = [
    o({ id: 'p1', learners: 9000, rating: 4.6, added: '2026-09-01' }),
    o({ id: 'p2', learners: 5000, rating: 4.9, assignedBy: 'Mr. Daniel Ssempala', added: '2026-10-29' }),
    o({ id: 'p3', learners: 7000, rating: 4.8, subject: 'English', added: '2026-10-20' }),
    o({ id: 'p4', learners: 3000, rating: 4.7, assignedBy: 'Ms. Grace Atim', added: '2026-10-30', progress: 0.3 }),
    o({ id: 'k1', curriculum: 'KCSE', learners: 99_000, rating: 5, assignedBy: 'Mr. Otieno', added: '2026-10-31' }),
  ];
  const rows = exploreRows(ROWS, { curriculum: 'UNEB', weakest: ['English'], now: NOW });
  const ids = (key: string) => rows.find((r) => r.key === key)?.items.map((x) => x.id);

  test('five rows in order, each with its title', () => {
    expect(rows.map((r) => r.title)).toEqual(['Most Popular', 'Assigned by Teachers', 'Recommended for You', 'Top Rated', 'New This Week']);
  });

  test('every row keeps to the chosen curriculum', () => {
    expect(rows.flatMap((r) => r.items).some((x) => x.curriculum !== 'UNEB')).toBe(false);
  });

  test('most popular: most learners first', () => {
    expect(ids('popular')).toEqual(['p1', 'p3', 'p2', 'p4']);
  });

  test('assigned by teachers: only what a teacher set', () => {
    expect(ids('assigned')).toEqual(['p2', 'p4']);
  });

  test('recommended: not started, weakest subject first', () => {
    expect(ids('recommended')?.[0]).toBe('p3');
    expect(ids('recommended')).not.toContain('p4');
  });

  test('top rated: highest rating first', () => {
    expect(ids('top')).toEqual(['p2', 'p3', 'p4', 'p1']);
  });

  test('new this week: added in the last seven days, newest first', () => {
    expect(ids('new')).toEqual(['p4', 'p2']);
  });

  test('a row with nothing in it is left out', () => {
    expect(exploreRows(ROWS, { curriculum: 'IB', weakest: [], now: NOW })).toEqual([]);
  });
});

describe('what a card says instead of a price', () => {
  test('how big it is, in the unit of its kind', () => {
    expect(offeringSize('Subjects', 36)).toBe('36 lessons');
    expect(offeringSize('Past Papers', 22)).toBe('22 papers');
    expect(offeringSize('Live Classes', 12)).toBe('12 sessions');
    expect(offeringSize('Practice', 400)).toBe('400 questions');
    expect(offeringSize('Shorts', 9)).toBe('9 clips');
    expect(offeringSize('Library', 3)).toBe('3 books');
  });

  test('one is singular', () => {
    expect(offeringSize('Subjects', 1)).toBe('1 lesson');
  });
});
