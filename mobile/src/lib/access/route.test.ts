import { accessRedirect } from './route';

describe('where the free month sends people', () => {
  test('once it has ended, the first page they open goes to Pricing, once a visit', () => {
    expect(accessRedirect({ path: '/', phase: 'locked', lock: null, pricingSeen: false })).toBe('/plans');
    expect(accessRedirect({ path: '/', phase: 'locked', lock: null, pricingSeen: true })).toBeNull();
    expect(accessRedirect({ path: '/plans', phase: 'locked', lock: null, pricingSeen: false })).toBeNull();
  });

  test('a page the plan opens goes to Pricing', () => {
    expect(accessRedirect({ path: '/learn/lesson', phase: 'locked', lock: { reason: 'pay' }, pricingSeen: true })).toBe('/plans');
  });

  test('a page above their plan goes to Pricing, asking for the plan that opens it', () => {
    expect(accessRedirect({ path: '/learn/live-room', phase: 'paid', lock: { reason: 'upgrade', needs: 'pro' }, pricingSeen: true })).toBe('/plans?need=pro');
  });

  test('a visitor browsing free goes to sign-up', () => {
    expect(accessRedirect({ path: '/learn/lesson', phase: null, lock: { reason: 'signup' }, pricingSeen: false })).toBe('/sign-up');
  });

  test('during the trial, or on a plan, nothing moves', () => {
    expect(accessRedirect({ path: '/', phase: 'trial', lock: null, pricingSeen: false })).toBeNull();
    expect(accessRedirect({ path: '/', phase: 'paid', lock: null, pricingSeen: false })).toBeNull();
    expect(accessRedirect({ path: '/', phase: null, lock: null, pricingSeen: false })).toBeNull();
  });
});
