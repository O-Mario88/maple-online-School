/**
 * Who sees which portal, and what each portal's menu holds. The app shell
 * draws the menu as a sidebar on wide screens and a tab bar on phones.
 *
 * Items marked `preview` are design screens built on mock data; they only
 * appear in builds with EXPO_PUBLIC_MOCK_DATA=true (see lib/mock.ts).
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
  /** An app path; every one has a route file (navigation.test.ts checks). */
  href: string;
  icon: IconName;
  /** A design screen on mock data, hidden from deployment builds. */
  preview?: boolean;
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

const item = (key: string, label: string, href: string, icon: IconName, preview = false): NavItem => ({ key, label, href, icon, preview });
const p = (key: string, label: string, href: string, icon: IconName): NavItem => item(key, label, href, icon, true);

const home = item('home', 'Home', '/', 'home');
const lessons = item('lessons', 'Lessons', '/lessons', 'play');
const library = item('library', 'Library', '/library', 'library');
const curriculum = item('curriculum', 'Curriculum', '/curriculum', 'map');
const fees = item('fees', 'Fees', '/fees', 'wallet');
const school = item('school', 'School', '/school', 'school');
const messages = item('messages', 'Messages', '/messages', 'chat');

// Order matters: on phones the first four (or five) become tabs.
const MENUS: Readonly<Record<Portal, readonly NavItem[]>> = {
  learner: [
    home,
    p('explore', 'Explore', '/learn/explore', 'search'),
    p('live', 'Live', '/learn/live', 'live'),
    library,
    p('passport', 'Passport', '/learn/passport', 'flag'),
    lessons,
    p('assignments', 'Assignments', '/learn/assignments', 'clipboard'),
    p('past-papers', 'Past papers', '/learn/past-papers', 'book'),
    p('shorts', 'Shorts', '/learn/shorts', 'sparkle'),
    p('progress', 'My progress', '/learn/progress', 'chart'),
    p('squad', 'Study squad', '/learn/squad', 'people'),
    p('offline', 'Offline', '/learn/offline', 'cloud'),
    curriculum,
    fees,
    p('billing', 'Wallet', '/learn/billing', 'wallet'),
  ],
  teacher: [
    home,
    p('calendar', 'Calendar', '/teach/calendar', 'calendar'),
    lessons,
    messages,
    p('grading', 'Marking', '/teach/grading', 'check'),
    library,
    curriculum,
    p('studio', 'AI studio', '/teach/studio', 'sparkle'),
    p('course-editor', 'Course builder', '/teach/course-editor', 'book'),
    p('host', 'Live host', '/teach/host', 'live'),
    p('shorts-creator', 'Shorts creator', '/teach/shorts', 'play'),
    p('class-spaces', 'Class spaces', '/teach/class-spaces', 'people'),
    p('storefront', 'Storefront', '/teach/storefront', 'person'),
    p('earnings', 'Earnings', '/teach/earnings', 'wallet'),
    p('verification', 'Verification', '/teach/verification', 'check'),
  ],
  parent: [
    { ...home, label: 'Family' },
    messages,
    fees,
    lessons,
    library,
    p('attendance', 'Attendance', '/family/attendance', 'calendar'),
    p('approvals', 'Approvals', '/family/approvals', 'check'),
    p('family-settings', 'Settings', '/family/settings', 'person'),
  ],
  school: [
    { ...home, label: 'Dashboard' },
    school,
    fees,
    lessons,
    library,
    messages,
    curriculum,
    p('onboarding', 'Set-up wizard', '/admin/onboarding', 'sparkle'),
    p('rosters', 'Rosters', '/admin/rosters', 'people'),
    p('timetable', 'Timetable', '/admin/timetable', 'calendar'),
    p('attendance-monitor', 'Attendance', '/admin/attendance', 'check'),
    p('academics', 'Academic year', '/admin/academics', 'map'),
    p('accounting', 'Accounting', '/admin/accounting', 'chart'),
    p('admin-settings', 'Roles and audit', '/admin/settings', 'person'),
  ],
  command: [
    { ...home, label: 'Overview' },
    p('trust', 'Trust and safety', '/command/trust', 'flag'),
    p('institutions', 'Schools', '/command/institutions', 'school'),
    p('revenue', 'Revenue', '/command/revenue', 'chart'),
    p('payouts', 'Payouts', '/command/payouts', 'wallet'),
    curriculum,
    library,
    p('ops', 'Operations', '/command/ops', 'live'),
    p('security', 'Security', '/command/security', 'alert'),
  ],
};

export function navFor(portal: Portal, mock = false): readonly NavItem[] {
  return MENUS[portal].filter((i) => mock || !i.preview);
}

const MAX_TABS = 5;

/** The phone tab bar: up to five items, or four and a More tab. */
export function tabBar(items: readonly NavItem[]): { tabs: readonly NavItem[]; more: boolean } {
  if (items.length <= MAX_TABS) return { tabs: items, more: false };
  return { tabs: items.slice(0, MAX_TABS - 1), more: true };
}

/** The menu item for the current path: Home only on "/", others by prefix. */
export function activeKey(items: readonly NavItem[], pathname: string): string | undefined {
  if (pathname === '/') return items.find((i) => i.href === '/')?.key;
  return items.find((i) => i.href !== '/' && (pathname === i.href || pathname.startsWith(`${i.href}/`)))?.key;
}
