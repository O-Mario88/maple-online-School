import { homeFor, isStaff } from './roles';

const membership = (role: string, status = 'active') => ({ institution_id: 1, institution_name: 'Maple', role, status });

describe('isStaff', () => {
  it('is true for an active teaching or leadership role', () => {
    expect(isStaff([membership('subject_teacher')])).toBe(true);
    expect(isStaff([membership('student'), membership('headteacher')])).toBe(true);
  });

  it('is false for students, parents and suspended staff', () => {
    expect(isStaff([membership('student')])).toBe(false);
    expect(isStaff([membership('parent')])).toBe(false);
    expect(isStaff([membership('class_teacher', 'suspended')])).toBe(false);
    expect(isStaff([])).toBe(false);
  });
});

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
