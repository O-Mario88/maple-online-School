import { homeFor } from './roles';

describe('homeFor', () => {
  it.each([
    ['student', 'My Learning'],
    ['teacher', 'My Classroom'],
    ['parent', 'My Children'],
    ['institution', 'School Command Centre'],
    ['admin', 'Platform Command Centre'],
  ])('gives a %s the "%s" home', (role, title) => {
    expect(homeFor(role).title).toBe(title);
  });

  it('falls back to the learner home for an unknown role', () => {
    expect(homeFor('something-new').title).toBe('My Learning');
  });
});
