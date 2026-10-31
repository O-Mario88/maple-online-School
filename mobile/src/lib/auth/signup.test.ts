import { apiRole, needsGuardian, newAccountProblem, parseDob, passwordProblem, signUpProblem } from './signup';

const TODAY = new Date(2026, 9, 31);

describe('parseDob', () => {
  it('reads DD / MM / YYYY and works out the age', () => {
    expect(parseDob('14 / 03 / 2014', TODAY)).toEqual({ iso: '2014-03-14', age: 12 });
    expect(parseDob('31/10/2008', TODAY)).toEqual({ iso: '2008-10-31', age: 18 });
    expect(parseDob('01/11/2008', TODAY)).toEqual({ iso: '2008-11-01', age: 17 });
  });

  it('turns away dates that are not real, in the future or implausible', () => {
    expect(parseDob('31/02/2014', TODAY)).toEqual({ problem: 'Enter a real date of birth as DD / MM / YYYY.' });
    expect(parseDob('2014-03-14', TODAY)).toEqual({ problem: 'Enter a real date of birth as DD / MM / YYYY.' });
    expect(parseDob('01/01/2027', TODAY)).toEqual({ problem: 'Your date of birth can’t be in the future.' });
    expect(parseDob('01/01/1900', TODAY)).toEqual({ problem: 'Check the year of your date of birth.' });
  });
});

describe('needsGuardian', () => {
  it('asks a parent to confirm for anyone under 18, the age of digital majority in Uganda', () => {
    expect(needsGuardian(17)).toBe(true);
    expect(needsGuardian(18)).toBe(false);
  });
});

describe('apiRole', () => {
  it('maps the form roles to the account roles the API creates; parents join through their child', () => {
    expect(apiRole('learner')).toBe('student');
    expect(apiRole('teacher')).toBe('teacher');
    expect(apiRole('school')).toBe('institution');
    expect(apiRole('parent')).toBeNull();
  });
});

describe('newAccountProblem', () => {
  const ok = { role: 'learner' as const, first: 'Amina', last: 'Okello', grade: 'Senior 2', dob: '14/03/2012', email: 'amina@school.test', password: 'Kampala-Rains-2026' };
  it('accepts a complete learner form', () => {
    expect(newAccountProblem(ok, TODAY)).toBeNull();
  });

  it('points at the first thing to fix', () => {
    expect(newAccountProblem({ ...ok, first: ' ' }, TODAY)).toBe('Enter your first name.');
    expect(newAccountProblem({ ...ok, last: '' }, TODAY)).toBe('Enter your last name.');
    expect(newAccountProblem({ ...ok, grade: '' }, TODAY)).toBe('Choose your class or grade.');
    expect(newAccountProblem({ ...ok, dob: '31/02/2012' }, TODAY)).toMatch(/real date/);
    expect(newAccountProblem({ ...ok, email: 'amina' }, TODAY)).toMatch(/email/);
    expect(newAccountProblem({ ...ok, password: 'short' }, TODAY)).toMatch(/8 characters/);
  });

  it('only asks learners for a class and date of birth', () => {
    expect(newAccountProblem({ ...ok, role: 'teacher', grade: '', dob: '' }, TODAY)).toBeNull();
  });
});

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
