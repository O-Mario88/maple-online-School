import { FREE_LIMITS, freeAllows, freeLeft, noFreeUse, recordFree } from './free';

const MONTH = '2026-11';
const opened = (path: string, ids: readonly (string | undefined)[], month = MONTH) => ids.reduce((use, id) => recordFree(path, id, use, month), noFreeUse(month));

describe('the free plan, each month', () => {
  test('5 video lessons, 1 live class and 10 past papers', () => {
    expect(FREE_LIMITS).toEqual({ lesson: 5, live: 1, paper: 10 });
  });

  test('every book in the library, with no limit', () => {
    for (const book of ['p6-maths', 'our-uganda', 'read']) {
      expect(freeAllows(`/learn/library/${book}`, undefined, noFreeUse(MONTH), MONTH)).toBe(true);
    }
  });

  test('any five lessons open; a sixth new one does not', () => {
    const use = opened('/learn/lesson', ['l1', 'l2', 'l3', 'l4', 'l9']);
    expect(freeAllows('/learn/lesson', 'l6', use, MONTH)).toBe(false);
    expect(freeLeft('lesson', use, MONTH)).toBe(0);
  });

  test('a lesson already opened this month opens again', () => {
    const use = opened('/learn/lesson', ['l1', 'l2', 'l3', 'l4', 'l5']);
    expect(freeAllows('/learn/lesson', 'l2', use, MONTH)).toBe(true);
  });

  test('one live class a month', () => {
    const use = opened('/learn/live-room', ['algebra']);
    expect(freeAllows('/learn/live-room', 'algebra', use, MONTH)).toBe(true);
    expect(freeAllows('/learn/live-room', 'genetics', use, MONTH)).toBe(false);
  });

  test('ten past papers a month', () => {
    const use = opened('/learn/paper', ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9']);
    expect(freeLeft('paper', use, MONTH)).toBe(1);
    expect(freeAllows('/learn/paper', 'p10', use, MONTH)).toBe(true);
    expect(freeAllows('/learn/paper', 'p11', recordFree('/learn/paper', 'p10', use, MONTH), MONTH)).toBe(false);
  });

  test('a page that names nothing counts as one item of its kind', () => {
    const use = opened('/learn/live-room', [undefined]);
    expect(freeAllows('/learn/live-room', undefined, use, MONTH)).toBe(true);
    expect(freeAllows('/learn/live-room', 'other', use, MONTH)).toBe(false);
  });

  test('a new month starts again', () => {
    const use = opened('/learn/live-room', ['algebra'], '2026-10');
    expect(freeAllows('/learn/live-room', 'genetics', use, MONTH)).toBe(true);
    expect(freeLeft('live', use, MONTH)).toBe(1);
  });

  test('opening something past the allowance is not counted', () => {
    const use = opened('/learn/live-room', ['algebra', 'genetics']);
    expect(use.live).toEqual(['algebra']);
  });

  test('nothing else is on the free plan', () => {
    for (const path of ['/learn/course', '/learn/shorts', '/learn/squads/s1', '/copilot', '/teach/studio']) {
      expect(freeAllows(path, 'x3', noFreeUse(MONTH), MONTH)).toBe(false);
    }
  });
});
