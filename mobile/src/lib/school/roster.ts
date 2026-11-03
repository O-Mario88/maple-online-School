import type { SchoolMember } from './types';

const LEARNER_ROLES = new Set(['student']);
const PARENT_ROLES = new Set(['parent']);

/** Roles whose names don't read well with underscores swapped for spaces. */
const ROLE_NAMES: Readonly<Record<string, string>> = {
  dos: 'Director of studies',
  ict_admin: 'ICT admin',
  student: 'Learner',
};

export function roleLabel(role: string): string {
  const named = ROLE_NAMES[role];
  if (named) return named;
  const words = role.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export interface RosterGroups {
  staff: SchoolMember[];
  learners: SchoolMember[];
  parents: SchoolMember[];
  /** Invitations not yet accepted, whatever the role. */
  pending: SchoolMember[];
}

function matches(m: SchoolMember, query: string): boolean {
  const q = query.trim().toLowerCase();
  return q === '' || m.full_name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
}

/** One school's members, filtered by a search, grouped for the roster page and sorted by name. */
export function rosterGroups(members: readonly SchoolMember[], school: number, query: string): RosterGroups {
  const shown = members.filter((m) => m.institution === school && matches(m, query)).sort((a, b) => a.full_name.localeCompare(b.full_name));
  const joined = shown.filter((m) => m.status !== 'pending');
  return {
    staff: joined.filter((m) => !LEARNER_ROLES.has(m.role) && !PARENT_ROLES.has(m.role)),
    learners: joined.filter((m) => LEARNER_ROLES.has(m.role)),
    parents: joined.filter((m) => PARENT_ROLES.has(m.role)),
    pending: shown.filter((m) => m.status === 'pending'),
  };
}
