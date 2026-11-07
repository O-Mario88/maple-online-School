import { paywallCopy } from './paywall-copy';

describe('the paywall words', () => {
  test('after the free month: Access Paused, and what still opens', () => {
    expect(paywallCopy({ kind: 'ended' })).toEqual({
      pill: 'Access Paused',
      tone: 'red',
      title: 'Your free month has ended',
      subtitle: 'You can still see your progress, the catalogue and free resources. Choose a plan to unlock full access and keep learning without limits.',
      phone: 'You can still see your progress, the catalogue and free resources. Choose a plan to open everything again.',
    });
  });

  test('during the free month: the days left', () => {
    expect(paywallCopy({ kind: 'trial', daysLeft: 13, ends: '16 Nov 2026' })).toMatchObject({ pill: 'Free Trial', tone: 'blue', title: '13 days left of your free month' });
    expect(paywallCopy({ kind: 'trial', daysLeft: 1, ends: '16 Nov 2026' }).title).toBe('1 day left of your free month');
    expect(paywallCopy({ kind: 'trial', daysLeft: 13, ends: '16 Nov 2026' }).subtitle).toContain('16 Nov 2026');
  });

  test('on a plan: which one, and change it here', () => {
    expect(paywallCopy({ kind: 'paid', plan: 'Pro Study Pass' })).toMatchObject({ pill: 'Your Plan', tone: 'green', title: 'You’re on Pro Study Pass' });
  });

  test('sent here for something above their plan: the plan that opens it', () => {
    expect(paywallCopy({ kind: 'upgrade', plan: 'Pro Study Pass', tier: 'pro' })).toMatchObject({ pill: 'Upgrade', tone: 'blue', title: 'Upgrade to Pro Study Pass' });
    expect(paywallCopy({ kind: 'upgrade', plan: 'Pro Study Pass', tier: 'pro' }).subtitle).toContain('Live classes');
    expect(paywallCopy({ kind: 'upgrade', plan: 'Premium + Tutoring', tier: 'premium' }).subtitle).toContain('private tutor');
  });
});
