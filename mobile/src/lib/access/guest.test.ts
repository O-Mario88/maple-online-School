import { guestEnabled, guestGreeting, guestLock } from './guest';

describe('browsing free without an account', () => {
  test('is offered only when the free resources have their content', () => {
    expect(guestEnabled(true)).toBe(true);
    expect(guestEnabled(false)).toBe(false);
  });

  test('a visitor can look through the catalogues', () => {
    for (const path of ['/learn/explore', '/learn/library', '/learn/past-papers']) {
      expect(guestLock(path, null)).toBeNull();
    }
  });

  test('a visitor can open anything free', () => {
    expect(guestLock('/learn/library/our-uganda', { source: 'maple', free: true })).toBeNull();
    expect(guestLock('/learn/course', { source: 'marketplace', free: true })).toBeNull();
  });

  test('everything else asks them to sign up, which starts their free month', () => {
    expect(guestLock('/learn/library/our-environment', { source: 'maple' })).toBe('signup');
    expect(guestLock('/learn/course', { source: 'marketplace', free: false })).toBe('signup');
    // Personal pages need an account even though they never lock for members.
    for (const path of ['/', '/learn/progress', '/learn/assignments', '/messages', '/plans']) {
      expect(guestLock(path, null)).toBe('signup');
    }
  });
});

test('visitors are welcomed to Maple, not greeted as the sample learner', () => {
  expect(guestGreeting('Daniel', true)).toBe('Welcome to Maple Online School');
  expect(guestGreeting('Daniel', false)).toBe('Hello, Daniel');
});
