import { signedOutLanding } from './landing';

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
