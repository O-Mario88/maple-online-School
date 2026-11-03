import { signedOutLanding } from './landing';

describe('signedOutLanding', () => {
  it('sends signed-out web visitors at / to the public homepage', () => {
    expect(signedOutLanding('web')).toBe('welcome');
  });

  it('keeps the phone apps on sign-in', () => {
    expect(signedOutLanding('ios')).toBe('sign-in');
    expect(signedOutLanding('android')).toBe('sign-in');
  });
});
