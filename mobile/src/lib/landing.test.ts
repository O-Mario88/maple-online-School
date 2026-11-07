import { goesHomeOnSignIn, signedOutLanding } from './landing';

describe('signedOutLanding', () => {
  it('sends signed-out web visitors at / to the public homepage when it has its content', () => {
    expect(signedOutLanding('web', true)).toBe('welcome');
  });

  it('keeps deployment web builds on sign-in while the homepage says "Coming soon"', () => {
    expect(signedOutLanding('web', false)).toBe('sign-in');
  });

  it('keeps the phone apps on sign-in', () => {
    expect(signedOutLanding('ios', true)).toBe('sign-in');
    expect(signedOutLanding('android', true)).toBe('sign-in');
  });
});

describe('goesHomeOnSignIn', () => {
  it('opens the dashboard right after someone signs in, not the page sign-in falls back to', () => {
    expect(goesHomeOnSignIn('signedOut', 'signedIn')).toBe(true);
  });

  it('leaves a restored session where its address points, and does nothing on sign-out', () => {
    expect(goesHomeOnSignIn('restoring', 'signedIn')).toBe(false);
    expect(goesHomeOnSignIn('signedIn', 'signedOut')).toBe(false);
    expect(goesHomeOnSignIn('signedIn', 'signedIn')).toBe(false);
    expect(goesHomeOnSignIn(undefined, 'signedIn')).toBe(false);
  });
});
