/** What each role sees first. Titles follow the five experiences in the product strategy. */
export interface RoleHome {
  title: string;
  subtitle: string;
}

const HOMES: Readonly<Record<string, RoleHome>> = {
  student: { title: 'My Learning', subtitle: 'Today’s priorities, assignments and feedback' },
  teacher: { title: 'My Classroom', subtitle: 'Your schedule, marking and learners who need you' },
  parent: { title: 'My Children', subtitle: 'Progress, attendance and how to help at home' },
  institution: { title: 'School Command Centre', subtitle: 'Academic, operational and financial health' },
  admin: { title: 'Platform Command Centre', subtitle: 'Schools, adoption and platform health' },
};

const FALLBACK = HOMES.student;

export function homeFor(role: string): RoleHome {
  return HOMES[role] ?? FALLBACK;
}

/** School roles that can set and mark work. Matches the Go API's staff roles. */
const STAFF_ROLES = new Set([
  'headteacher', 'deputy', 'dos', 'exam_officer', 'ict_admin', 'registrar',
  'class_teacher', 'subject_teacher', 'librarian', 'counselor',
]);

interface MembershipLike {
  role: string;
  status: string;
}

/** Leadership roles that can publish report cards. Matches the Go API's roles.Leaders. */
const LEADER_ROLES = new Set(['headteacher', 'deputy', 'dos', 'exam_officer', 'ict_admin']);

/** Whether the person leads at least one school. */
export function isLeader(memberships: readonly MembershipLike[]): boolean {
  return memberships.some((m) => m.status === 'active' && LEADER_ROLES.has(m.role));
}

/** Whether the person teaches or leads in at least one school. */
export function isStaff(memberships: readonly MembershipLike[]): boolean {
  return memberships.some((m) => m.status === 'active' && STAFF_ROLES.has(m.role));
}

/** Roles that confirm who belongs to a learner. Matches the Go API's roles.Admissions. */
const ADMISSIONS_ROLES = new Set([...LEADER_ROLES, 'registrar']);

interface SchoolMembership extends MembershipLike {
  institution_id: number;
  institution_name: string;
}

/** Schools where the person can approve or decline parents' links to learners. */
export function admissionsSchools(memberships: readonly SchoolMembership[]): { id: number; name: string }[] {
  const seen = new Map<number, string>();
  for (const m of memberships) {
    if (m.status === 'active' && ADMISSIONS_ROLES.has(m.role)) seen.set(m.institution_id, m.institution_name);
  }
  return [...seen].map(([id, name]) => ({ id, name }));
}
