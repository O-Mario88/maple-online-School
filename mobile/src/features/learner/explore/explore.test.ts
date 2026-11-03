import { continueLearning, filterCourses, goalsDone, justForYou, liveNow, type Offering, toggleGoal, upcoming } from './explore';

const o = (over: Partial<Offering>): Offering => ({ id: 'x', title: 'Course', kind: 'Courses', curriculum: 'UNEB', subject: 'Mathematics', level: 'S3', rating: 4.8, learners: 100, priceUGX: 0, progress: 0, ...over });
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
