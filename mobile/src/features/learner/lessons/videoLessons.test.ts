import { clock, continueWatching, filterLessons, learningPath, lessonStatus, subjectProgress, topicsOf, type VideoLessonItem } from './videoLessons';

const v = (over: Partial<VideoLessonItem>): VideoLessonItem => ({
  id: 'x',
  title: 'Lesson',
  subject: 'Mathematics',
  level: 'UACE',
  topic: 'Quadratics',
  n: 1,
  seconds: 600,
  watched: 0,
  added: '2026-10-01',
  mine: true,
  board: 'y = x²',
  uploader: 'Mr. James Kato',
  views: 100,
  rating: 4.5,
  likes: 10,
  comments: 2,
  ...over,
});
const LIST: readonly VideoLessonItem[] = [
  v({ id: 'a', n: 1, watched: 600, added: '2026-09-01', views: 900, rating: 4.9 }),
  v({ id: 'b', n: 3, watched: 300, added: '2026-10-20', lastWatched: '2026-10-30', views: 300, rating: 4.6 }),
  v({ id: 'c', n: 2, topic: 'Quadratics', added: '2026-10-25', views: 500, rating: 4.7 }),
  v({ id: 'd', n: 1, topic: 'Trigonometry', watched: 100, lastWatched: '2026-10-10', mine: false, views: 50, rating: 4.2 }),
  v({ id: 'e', subject: 'Physics', topic: 'Motion', views: 2000, rating: 4.8 }),
];
const none = { downloaded: [], later: [] };

describe('the Video Lessons page', () => {
  test('a lesson is completed, in progress or not started by how much is watched', () => {
    expect(lessonStatus(LIST[0])).toBe('done');
    expect(lessonStatus(LIST[1])).toBe('progress');
    expect(lessonStatus(LIST[2])).toBe('new');
  });

  test('filters by subject, level and topic; newest first by default', () => {
    expect(filterLessons(LIST, { tab: 'all', subject: 'Mathematics', sort: 'latest', saved: none }).map((x) => x.id)).toEqual(['c', 'b', 'd', 'a']);
    expect(filterLessons(LIST, { tab: 'all', subject: 'Mathematics', topic: 'Trigonometry', sort: 'latest', saved: none }).map((x) => x.id)).toEqual(['d']);
  });

  test('sorts by most viewed, top rated or lesson order', () => {
    expect(filterLessons(LIST, { tab: 'all', subject: 'Mathematics', sort: 'popular', saved: none }).map((x) => x.id)).toEqual(['a', 'c', 'b', 'd']);
    expect(filterLessons(LIST, { tab: 'all', subject: 'Mathematics', sort: 'rating', saved: none })[0].id).toBe('a');
    expect(filterLessons(LIST, { tab: 'all', subject: 'Mathematics', topic: 'Quadratics', sort: 'order', saved: none }).map((x) => x.id)).toEqual(['a', 'c', 'b']);
  });

  test('the tabs: my subjects, downloaded, watch later and completed', () => {
    const saved = { downloaded: ['c'], later: ['b', 'e'] };
    expect(filterLessons(LIST, { tab: 'mine', sort: 'latest', saved }).map((x) => x.id)).not.toContain('d');
    expect(filterLessons(LIST, { tab: 'downloaded', sort: 'latest', saved }).map((x) => x.id)).toEqual(['c']);
    expect(filterLessons(LIST, { tab: 'later', sort: 'latest', saved }).map((x) => x.id).sort()).toEqual(['b', 'e']);
    expect(filterLessons(LIST, { tab: 'completed', sort: 'latest', saved }).map((x) => x.id)).toEqual(['a']);
  });

  test('progress in a subject: counts and the share watched', () => {
    expect(subjectProgress(LIST, 'Mathematics')).toEqual({ completed: 1, inProgress: 2, notStarted: 1, pct: 42 });
  });

  test('continue watching: the lesson in progress watched most recently', () => {
    expect(continueWatching(LIST, 'Mathematics')?.id).toBe('b');
    expect(continueWatching(LIST, 'Physics')).toBeUndefined();
  });

  test('the learning path: a topic in lesson order', () => {
    expect(learningPath(LIST, 'Mathematics', 'Quadratics').map((x) => x.id)).toEqual(['a', 'c', 'b']);
  });

  test('topics of a subject, once each', () => {
    expect(topicsOf(LIST, 'Mathematics')).toEqual(['Quadratics', 'Trigonometry']);
  });

  test('a running time as the player shows it', () => {
    expect(clock(1458)).toBe('24:18');
    expect(clock(65)).toBe('1:05');
  });
});
