/**
 * Who sees which portal, and what each portal's menu holds. The app shell
 * draws the menu as a sidebar on wide screens and a tab bar on phones.
 */
import type { IconName } from './icons';

export const PORTALS = ['learner', 'teacher', 'parent', 'school', 'command'] as const;
export type Portal = (typeof PORTALS)[number];

export const PORTAL_LABELS: Readonly<Record<Portal, string>> = {
  learner: 'Learner',
  teacher: 'Teacher',
  parent: 'Parent',
  school: 'School',
  command: 'Maple Command',
};

export interface Person {
  role: string;
  memberships: readonly { role: string; status: string }[];
  children: readonly { user_id: number }[];
}

export interface NavItem {
  key: string;
  label: string;
  href: '/' | '/lessons' | '/library' | '/curriculum' | '/fees' | '/school';
  icon: IconName;
  /** Shown in the phone tab bar; everything is shown in the sidebar. */
  primary: boolean;
}

// Matches the Go API's roles: Leaders, Finance and Staff.
const SCHOOL_ROLES = new Set(['headteacher', 'deputy', 'dos', 'exam_officer', 'ict_admin', 'registrar']);
const TEACHING_ROLES = new Set(['class_teacher', 'subject_teacher', 'librarian', 'counselor']);

/** The portals an account can use, its main one first. */
export function portalsFor(person: Person): Portal[] {
  const active = person.memberships.filter((m) => m.status === 'active');
  const leads = active.some((m) => SCHOOL_ROLES.has(m.role));
  const teaches = leads || active.some((m) => TEACHING_ROLES.has(m.role));
  const portals: Portal[] = [];
  const add = (p: Portal, when: boolean) => {
    if (when && !portals.includes(p)) portals.push(p);
  };
  add('command', person.role === 'admin');
  add('school', leads || person.role === 'institution');
  add('teacher', teaches || person.role === 'teacher');
  add('parent', person.role === 'parent' || person.children.length > 0);
  add('learner', person.role === 'student');
  return portals.length > 0 ? portals : ['learner'];
}

const home: NavItem = { key: 'home', label: 'Home', href: '/', icon: 'home', primary: true };
const lessons: NavItem = { key: 'lessons', label: 'Lessons', href: '/lessons', icon: 'play', primary: true };
const library: NavItem = { key: 'library', label: 'Library', href: '/library', icon: 'library', primary: true };
const curriculum: NavItem = { key: 'curriculum', label: 'Curriculum', href: '/curriculum', icon: 'map', primary: true };
const fees: NavItem = { key: 'fees', label: 'Fees', href: '/fees', icon: 'wallet', primary: true };
const school: NavItem = { key: 'school', label: 'School', href: '/school', icon: 'school', primary: true };

const MENUS: Readonly<Record<Portal, readonly NavItem[]>> = {
  learner: [home, lessons, library, curriculum, fees],
  teacher: [home, lessons, library, curriculum],
  parent: [{ ...home, label: 'Family' }, lessons, fees, library],
  school: [{ ...home, label: 'Dashboard' }, school, fees, lessons, library, { ...curriculum, primary: false }],
  command: [{ ...home, label: 'Overview' }, curriculum, library],
};

export function navFor(portal: Portal): readonly NavItem[] {
  return MENUS[portal];
}

/** The menu item for the current path: Home only on "/", others by prefix. */
export function activeKey(items: readonly NavItem[], pathname: string): string | undefined {
  if (pathname === '/') return items.find((i) => i.href === '/')?.key;
  return items.find((i) => i.href !== '/' && (pathname === i.href || pathname.startsWith(`${i.href}/`)))?.key;
}
