import { roleLabel, rosterGroups } from './roster';
import type { SchoolMember } from './types';

const member = (id: number, name: string, role: string, status: SchoolMember['status'] = 'active', institution = 1): SchoolMember => ({
  id,
  user: id * 10,
  full_name: name,
  email: `${name.toLowerCase().replace(' ', '.')}@school.test`,
  institution,
  institution_name: 'Alpha',
  role,
  status,
  joined_at: '2026-09-01T08:00:00Z',
});

describe('rosterGroups', () => {
  const members = [
    member(1, 'Zara Head', 'headteacher'),
    member(2, 'Ben Teacher', 'subject_teacher', 'suspended'),
    member(3, 'Amani Learner', 'student'),
    member(4, 'Grace Parent', 'parent'),
    member(5, 'New Teacher', 'class_teacher', 'pending'),
    member(6, 'Other School', 'student', 'active', 2),
  ];

  it('groups one school’s members by staff, learners and parents, with invitations apart', () => {
    const g = rosterGroups(members, 1, '');
    expect(g.staff.map((m) => m.full_name)).toEqual(['Ben Teacher', 'Zara Head']);
    expect(g.learners.map((m) => m.full_name)).toEqual(['Amani Learner']);
    expect(g.parents.map((m) => m.full_name)).toEqual(['Grace Parent']);
    expect(g.pending.map((m) => m.full_name)).toEqual(['New Teacher']);
  });

  it('filters by name or email, ignoring case', () => {
    expect(rosterGroups(members, 1, 'zara').staff.map((m) => m.id)).toEqual([1]);
    expect(rosterGroups(members, 1, 'AMANI.LEARNER@').learners.map((m) => m.id)).toEqual([3]);
    expect(rosterGroups(members, 1, 'nobody').staff).toEqual([]);
  });
});

describe('roleLabel', () => {
  it('names school roles in plain words', () => {
    expect(roleLabel('dos')).toBe('Director of studies');
    expect(roleLabel('subject_teacher')).toBe('Subject teacher');
    expect(roleLabel('something_new')).toBe('Something new');
  });
});
