import { stripMessage } from './strip';

describe('the free-month strip', () => {
  test('wide screens get the full sentence', () => {
    expect(stripMessage({ kind: 'guest' }, false)).toEqual({ text: 'You’re browsing free resources. Sign up free and everything opens for a month.', action: 'Sign up free' });
    expect(stripMessage({ kind: 'trial', daysLeft: 13, ends: '16 Nov 2026' }, false)).toEqual({ text: 'Free trial: 13 days left. Everything is open until 16 Nov 2026.', action: 'Choose a plan' });
    expect(stripMessage({ kind: 'ended' }, false)).toEqual({ text: 'Your free month has ended. Free plan: 5 lessons, 1 live class and 10 past papers a month, every library book, with ads.', action: 'Pay to continue' });
  });

  test('phones get a short line that fits beside the button', () => {
    expect(stripMessage({ kind: 'guest' }, true).text).toBe('Browsing free resources.');
    expect(stripMessage({ kind: 'trial', daysLeft: 1, ends: '16 Nov 2026' }, true).text).toBe('Free trial: 1 day left.');
    expect(stripMessage({ kind: 'ended' }, true).text).toBe('Your free month has ended.');
  });
});
