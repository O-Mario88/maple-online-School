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

/** Whether the person teaches or leads in at least one school. */
export function isStaff(memberships: readonly MembershipLike[]): boolean {
  return memberships.some((m) => m.status === 'active' && STAFF_ROLES.has(m.role));
}
