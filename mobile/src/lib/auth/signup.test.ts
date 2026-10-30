import { passwordProblem, signUpProblem } from './signup';

describe('passwordProblem', () => {
  it('matches the server rules', () => {
    expect(passwordProblem('short1!', 'a@b.test')).toMatch(/8 characters/);
    expect(passwordProblem('12345678901', 'a@b.test')).toMatch(/numbers/);
    expect(passwordProblem('Password123', 'a@b.test')).toMatch(/common/);
    expect(passwordProblem('amina.okello!', 'amina.okello@school.test')).toMatch(/email/);
    expect(passwordProblem('Kampala-Rains-2026', 'amina@school.test')).toBeNull();
  });
});

describe('signUpProblem', () => {
  const ok = { email: 'amina@school.test', fullName: 'Amina Okello', password: 'Kampala-Rains-2026', confirm: 'Kampala-Rains-2026' };
  it('accepts a complete form', () => {
    expect(signUpProblem(ok)).toBeNull();
  });
  it('points at the first thing to fix', () => {
    expect(signUpProblem({ ...ok, fullName: ' ' })).toMatch(/name/);
    expect(signUpProblem({ ...ok, email: 'amina' })).toMatch(/email/);
    expect(signUpProblem({ ...ok, confirm: 'different' })).toMatch(/match/);
  });
});
