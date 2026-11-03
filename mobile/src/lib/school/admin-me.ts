import { roleLabel } from './roster';

const COUNTRIES: Readonly<Record<string, string>> = { UG: 'Uganda', KE: 'Kenya', RW: 'Rwanda', TZ: 'Tanzania' };

/** "Daniel Okello" as "DO": the first letters of the first two names, as the designed top bars show the admin. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';
}

export function countryName(code: string): string {
  return COUNTRIES[code] ?? code;
}

interface PersonLike {
  full_name: string;
  memberships: readonly { institution_id: number; role: string; status: string }[];
}

export interface AdminMe {
  name: string;
  role: string;
  initial: string;
  notifications: number;
}

/** The signed-in person as the designed pages' top bar shows them: name, role at this school, initial and unread count. */
export function adminMe(person: PersonLike, school: number, unread: number): AdminMe {
  const m = person.memberships.find((x) => x.institution_id === school && x.status === 'active');
  const name = person.full_name.trim();
  return { name, role: m ? roleLabel(m.role) : 'School staff', initial: name ? name[0].toUpperCase() : '?', notifications: unread };
}
