import { adFor, adPick } from './ads';

describe('ads on the free tier', () => {
  test('nobody on the free month or a plan sees ads', () => {
    expect(adFor({ guest: false, phase: 'trial', path: '/learn/library' })).toBeNull();
    expect(adFor({ guest: false, phase: 'paid', path: '/learn/library' })).toBeNull();
    expect(adFor({ guest: false, phase: null, path: '/learn/library' })).toBeNull();
  });

  test('the pages the free tier opens carry the bigger ad', () => {
    for (const path of ['/learn/library', '/learn/library/p6-maths', '/learn/lesson', '/learn/paper']) {
      expect(adFor({ guest: false, phase: 'locked', path })).toBe('featured');
    }
  });

  test('other pages carry a slim one', () => {
    expect(adFor({ guest: false, phase: 'locked', path: '/learn/explore' })).toBe('banner');
    expect(adFor({ guest: false, phase: 'locked', path: '/' })).toBe('banner');
  });

  test('visitors browsing free see them too', () => {
    expect(adFor({ guest: true, phase: null, path: '/learn/library' })).toBe('featured');
    expect(adFor({ guest: true, phase: null, path: '/learn/explore' })).toBe('banner');
  });

  test('none where people pay, sign in or are in a live class', () => {
    for (const path of ['/plans', '/learn/billing', '/learn/account', '/sign-in', '/sign-up', '/checkout', '/learn/live-room']) {
      expect(adFor({ guest: false, phase: 'locked', path })).toBeNull();
    }
  });

  test('each page shows the same ad every time, and pages differ', () => {
    expect(adPick('/learn/library', 4)).toBe(adPick('/learn/library', 4));
    const picks = new Set(['/', '/learn/explore', '/learn/library', '/learn/lesson', '/learn/progress'].map((p) => adPick(p, 4)));
    expect(picks.size).toBeGreaterThan(1);
    expect([...picks].every((i) => i >= 0 && i < 4)).toBe(true);
  });
});
