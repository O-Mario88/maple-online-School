import { admissionsSchools, homeFor, isLeader, isStaff } from './roles';

describe('isLeader', () => {
  it('is true only for active school leadership roles', () => {
    expect(isLeader([{ role: 'headteacher', status: 'active' }])).toBe(true);
    expect(isLeader([{ role: 'class_teacher', status: 'active' }])).toBe(false);
    expect(isLeader([{ role: 'dos', status: 'suspended' }])).toBe(false);
  });
});

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

describe('admissionsSchools', () => {
  it('lists schools where the person leads or is the registrar', () => {
    const memberships = [
      { institution_id: 1, institution_name: 'Alpha', role: 'registrar', status: 'active' },
      { institution_id: 2, institution_name: 'Beta', role: 'subject_teacher', status: 'active' },
      { institution_id: 3, institution_name: 'Gamma', role: 'headteacher', status: 'suspended' },
      { institution_id: 4, institution_name: 'Delta', role: 'dos', status: 'active' },
    ];
    expect(admissionsSchools(memberships)).toEqual([
      { id: 1, name: 'Alpha' },
      { id: 4, name: 'Delta' },
    ]);
  });
});
