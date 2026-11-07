/**
 * Which pages a role may open. Each portal owns an area (/learn, /teach, /admin, /family,
 * /command); school pages also follow the Go API's role groups (internal/roles), so a menu never
 * offers a page the API would refuse. Menus are filtered with this, and the app shell shows
 * "not for your role" if someone opens such a page directly.
 */
import type { Portal } from '@/lib/navigation';

// Mirrors api/internal/roles.
const LEADERS = ['headteacher', 'deputy', 'dos', 'exam_officer', 'ict_admin'];
const TEACHERS = ['class_teacher', 'subject_teacher', 'librarian', 'counselor'];
const STAFF = [...LEADERS, ...TEACHERS, 'registrar'];
const FINANCE = ['headteacher', 'deputy', 'registrar'];
const ADMISSIONS = [...LEADERS, 'registrar'];

export interface Who {
  /** The portals the account may use (portalsFor). */
  portals: readonly Portal[];
  /** Active school membership roles. */
  schoolRoles: readonly string[];
  /** The school's own account (role "institution"): every school page. */
  institution: boolean;
}

/** Pages under another portal's area that every portal uses: Classes and the one Library. */
const SHARED = ['/learn/live', '/learn/library'];
const AREAS: readonly [string, Portal][] = [
  ['/command/', 'command'],
  ['/admin/', 'school'],
  ['/teach/', 'teacher'],
  ['/family/', 'parent'],
  ['/learn/', 'learner'],
];
/** School pages that need a role group, most specific first; other school pages need any staff role. */
const SCHOOL_PAGES: readonly [string, readonly string[]][] = [
  ['/admin/finance/', FINANCE],
  ['/admin/subscription', FINANCE],
  ['/admin/admissions', ADMISSIONS],
  ['/admin/settings', LEADERS],
  ['/admin/onboarding', LEADERS],
  ['/admin/growth', LEADERS],
  ['/admin/school-profile', LEADERS],
  ['/admin/community', LEADERS],
];

const under = (path: string, prefix: string) => path === prefix.replace(/\/$/, '') || path.startsWith(prefix.endsWith('/') ? prefix : `${prefix}/`) || path === prefix;

export function canOpen(path: string, who: Who): boolean {
  if (SHARED.some((p) => under(path, p))) return true;
  const area = AREAS.find(([prefix]) => path.startsWith(prefix));
  if (!area) return true;
  if (!who.portals.includes(area[1])) return false;
  if (area[1] !== 'school' || who.institution) return true;
  const rule = SCHOOL_PAGES.find(([p]) => under(path, p));
  const allowed = rule ? rule[1] : STAFF;
  return who.schoolRoles.some((r) => allowed.includes(r));
}
