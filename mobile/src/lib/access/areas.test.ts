import { payerFor, resourceFor } from './areas';

describe('who pays for each mode', () => {
  test('learners, teachers and schools have a free month; parents and Maple staff do not', () => {
    expect(payerFor('learner')).toBe('learner');
    expect(payerFor('teacher')).toBe('teacher');
    expect(payerFor('school')).toBe('school');
    expect(payerFor('parent')).toBeNull();
    expect(payerFor('command')).toBeNull();
  });
});

describe('which pages open a resource', () => {
  test('learners can always see the catalogue, their progress and their school work', () => {
    for (const path of ['/', '/learn/explore', '/learn/library', '/learn/past-papers', '/learn/progress', '/learn/assignments', '/learn/billing']) {
      expect(resourceFor(path, 'learner')).toBeNull();
    }
  });

  test("opening a lesson, paper, book or the study helper is Maple's content, on any plan", () => {
    for (const path of ['/learn/lesson', '/learn/paper', '/learn/library/our-environment', '/learn/shorts', '/copilot']) {
      expect(resourceFor(path, 'learner')).toEqual({ source: 'maple' });
    }
  });

  test('live classes and study squads need Pro or above', () => {
    for (const path of ['/learn/live-room', '/learn/squads/s1']) {
      expect(resourceFor(path, 'learner')).toEqual({ source: 'maple', needs: 'pro' });
    }
  });

  test('a subject takes its source and price from the subject opened', () => {
    expect(resourceFor('/learn/course', 'learner', { source: 'marketplace', free: false })).toEqual({ source: 'marketplace', free: false });
    expect(resourceFor('/learn/course', 'learner', { source: 'maple', free: true })).toEqual({ source: 'maple', free: true });
    expect(resourceFor('/learn/course', 'learner')).toEqual({ source: 'marketplace' });
  });

  test("teachers keep their classes and earnings; Maple's teaching tools lock", () => {
    expect(resourceFor('/teach/earnings', 'teacher')).toBeNull();
    expect(resourceFor('/teach/grading', 'teacher')).toBeNull();
    expect(resourceFor('/teach/studio', 'teacher')).toEqual({ source: 'maple' });
    expect(resourceFor('/teach/live-host/12', 'teacher')).toEqual({ source: 'maple' });
  });

  test('schools keep settings and set-up; the other admin pages lock', () => {
    expect(resourceFor('/admin/settings', 'school')).toBeNull();
    expect(resourceFor('/admin/onboarding', 'school')).toBeNull();
    expect(resourceFor('/admin/academics', 'school')).toEqual({ source: 'maple' });
    expect(resourceFor('/admin/finance/fees', 'school')).toEqual({ source: 'maple' });
  });

  test('a page is only gated in its own mode', () => {
    expect(resourceFor('/teach/studio', 'learner')).toBeNull();
    expect(resourceFor('/learn/lesson', 'parent')).toBeNull();
  });
});
