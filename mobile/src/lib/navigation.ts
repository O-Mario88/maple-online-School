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
  /** A shorter label for the phone tab bar, where a fifth of the screen is all there is. */
  short?: string;
  /** An app path; every one has a route file (navigation.test.ts checks). */
  href: string;
  icon: IconName;
  /** A design screen on mock data, hidden from deployment builds. */
  preview?: boolean;
  /** Other paths that light this item, such as the live hub for Classes. */
  also?: readonly string[];
  /** Where the item opens on mock data, when a designed page stands in for the live one. */
  designHref?: string;
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
// Lessons and live classes live on the Classes page for everyone; staff plan and publish there.
const lessons: NavItem = { ...item('lessons', 'Lessons', '/learn/live', 'play'), also: ['/learn/live'] };
// One Library page for everyone; staff add and share items there.
const library: NavItem = { ...item('library', 'Library', '/learn/library', 'library'), also: ['/learn/library'] };
const curriculum = item('curriculum', 'Curriculum', '/curriculum', 'map');
const fees = item('fees', 'Fees', '/fees', 'wallet');
const school = item('school', 'Set-up', '/admin/onboarding', 'school');
const messages = item('messages', 'Messages', '/messages', 'chat');

// Order matters: on phones the first four (or five) become tabs.
// The plans page: where the free month continues, and where people land once it has ended.
const pricing = p('pricing', 'Pricing', '/plans', 'wallet');

const MENUS: Readonly<Record<Portal, readonly NavItem[]>> = {
  learner: [
    home,
    p('explore', 'Explore', '/learn/explore', 'search'),
    { ...lessons, label: 'Classes', icon: 'person' },
    // Ported to the API: the designed page in every build.
    { key: 'assignments', label: 'Assignments', href: '/learn/assignments', icon: 'clipboard' },
    library,
    p('progress', 'My progress', '/learn/progress', 'chart'),
    p('projects', 'Projects', '/learn/projects', 'folder'),
    p('exam', 'Exam practice', '/learn/paper', 'timer'),
    p('past-papers', 'Past papers', '/learn/past-papers', 'book'),
    p('shorts', 'Shorts', '/learn/shorts', 'sparkle'),
    p('squad', 'Study squads', '/learn/squads', 'people'),
    p('passport', 'Passport', '/learn/passport', 'flag'),
    p('offline', 'Offline', '/learn/offline', 'cloud'),
    curriculum,
    fees,
    pricing,
    p('billing', 'Billing', '/learn/billing', 'wallet'),
    p('account', 'My account', '/learn/account', 'person'),
  ],
  teacher: [
    home,
    p('calendar', 'Calendar', '/teach/calendar', 'calendar'),
    lessons,
    messages,
    item('grading', 'Marking', '/teach/grading', 'check'),
    p('assignments-new', 'Create assignment', '/teach/assignments/new', 'clipboard'),
    p('attendance-register', 'Attendance register', '/teach/attendance', 'calendar'),
    p('learners-heatmap', 'Mastery heatmap', '/teach/learners', 'chart'),
    library,
    curriculum,
    p('studio', 'AI studio', '/teach/studio', 'sparkle'),
    p('course-editor', 'Subject builder', '/teach/course-editor', 'book'),
    p('host', 'Live host', '/teach/host', 'live'),
    p('shorts-creator', 'Shorts creator', '/teach/shorts', 'play'),
    p('class-spaces', 'Class spaces', '/teach/class-spaces', 'people'),
    p('storefront', 'Storefront', '/teach/storefront', 'person'),
    p('earnings', 'Earnings', '/teach/earnings', 'wallet'),
    pricing,
    p('verification', 'Verification', '/teach/verification', 'check'),
    p('teacher-library', 'Resource library', '/teach/library', 'folder'),
  ],
  parent: [
    { ...home, label: 'Family' },
    messages,
    fees,
    lessons,
    library,
    item('attendance', 'Attendance', '/family/attendance', 'calendar'),
    p('approvals', 'Approvals', '/family/approvals', 'check'),
    item('family-settings', 'Settings', '/family/settings', 'person'),
  ],
  school: [
    { ...home, label: 'Dashboard' },
    school,
    // Design builds open the school-admin references; real builds keep the live fees and library pages.
    { ...fees, designHref: '/admin/finance/fees' },
    lessons,
    { ...library, designHref: '/admin/library' },
    messages,
    curriculum,
    item('rosters', 'Rosters', '/admin/rosters', 'people'),
    item('timetable', 'Timetable', '/admin/timetable', 'calendar'),
    item('attendance-monitor', 'Attendance', '/admin/attendance', 'check'),
    p('qr-scanner', 'QR scanner', '/admin/scan', 'scan'),
    item('report-cards', 'Report cards', '/admin/report-cards', 'clipboard'),
    item('academics', 'Academic year', '/admin/academics', 'map'),
    item('ledger', 'Student ledger', '/admin/finance/ledger', 'wallet'),
    p('accounting', 'Accounting', '/admin/finance/accounting', 'chart'),
    p('chart-of-accounts', 'Chart of accounts', '/admin/finance/chart-of-accounts', 'clipboard'),
    p('journal-entries', 'Journal entries', '/admin/finance/journal-entries', 'doc'),
    pricing,
    p('admin-settings', 'Roles and audit', '/admin/settings', 'person'),
  ],
  command: [
    // Design builds open the Maple Command references; real builds keep the live home and curriculum.
    { ...home, label: 'Overview' },
    p('executive', 'Executive overview', '/command/overview', 'chart'),
    { ...p('trust', 'Trust and safety', '/command/trust', 'flag'), short: 'Trust' },
    p('trust-queue', 'Verification queue', '/command/trust-queue', 'check'),
    p('institutions', 'Schools', '/command/institutions', 'school'),
    p('revenue', 'Revenue', '/command/finance/revenue', 'chart'),
    p('payouts', 'Payouts', '/command/finance/payouts', 'wallet'),
    p('invoices', 'Invoices', '/command/finance/invoices', 'receipt'),
    p('tax', 'Tax and compliance', '/command/finance/tax', 'percent'),
    p('pf-subscriptions', 'Subscriptions', '/command/finance/subscriptions', 'sync'),
    p('pf-transactions', 'Payment transactions', '/command/finance/transactions', 'wallet'),
    p('pf-settlements', 'Settlements', '/command/finance/settlements', 'layers'),
    p('pf-receivables', 'Receivables', '/command/finance/receivables', 'database'),
    p('pf-recognition', 'Revenue recognition', '/command/finance/revenue-recognition', 'layers'),
    p('pf-contracts', 'Contracts', '/command/finance/contracts', 'doc'),
    p('pf-teacher-payables', 'Teacher payables', '/command/finance/teacher-payables', 'people'),
    p('pf-expenses', 'Corporate expenses', '/command/finance/expenses', 'wallet'),
    p('pf-payroll', 'Corporate payroll', '/command/finance/payroll', 'people'),
    p('pf-ledger', 'General ledger', '/command/finance/accounting', 'book'),
    p('pf-forecast', 'Forecasting', '/command/finance/forecast', 'chart'),
    p('pf-reports', 'Financial reports', '/command/finance/reports', 'doc'),
    p('pf-profitability', 'Profitability', '/command/finance/profitability', 'chart'),
    p('pf-integrations', 'Integrations', '/command/finance/integrations', 'link'),
    { ...curriculum, designHref: '/command/curricula' },
    library,
    p('ops', 'Operations', '/command/ops', 'live'),
    p('security', 'Security', '/command/security', 'alert'),
    p('audit-logs', 'Audit logs', '/command/security/audit-logs', 'clipboard'),
    p('data-requests', 'Data requests', '/command/security/data-requests', 'lock'),
    p('support', 'Support', '/command/security/support', 'help'),
    p('communications', 'Communications', '/command/communications', 'chat'),
    p('announcements', 'Announcements', '/command/communications/announcements', 'megaphone'),
    p('broadcasts', 'Broadcasts', '/command/communications/broadcasts', 'send'),
  ],
};

export function navFor(portal: Portal, mock = false): readonly NavItem[] {
  const shown = MENUS[portal].filter((i) => mock || !i.preview);
  return mock ? shown.map((i) => (i.designHref ? { ...i, href: i.designHref } : i)) : shown;
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
  const under = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return items.find((i) => i.href !== '/' && [i.href, ...(i.also ?? [])].some(under))?.key;
}

/**
 * Public pages anyone can open without signing in. Design builds show them
 * on sample data; deployment builds say "Coming soon" until the API serves them.
 */
export const PUBLIC_PREVIEWS = [
  { href: '/welcome', label: 'Home page', icon: 'sparkle' },
  { href: '/explore', label: 'Catalogue', icon: 'search' },
  { href: '/schools', label: 'For schools', icon: 'school' },
  { href: '/shorts', label: 'Maple Shorts', icon: 'play' },
  { href: '/@sarah-kimani', route: '[handle]', label: 'Teacher storefront', icon: 'person' },
  { href: '/live/p7-maths-revision-bootcamp', route: 'live/[slug]', label: 'Live bootcamp', icon: 'live' },
  { href: '/past-papers/uneb-uce/mathematics/2025', route: 'past-papers/[board]/[subject]/[year]', label: 'Past paper (free question)', icon: 'book' },
  { href: '/courses/complete-mathematics-primary-7', route: 'courses/[slug]', label: 'Subject page', icon: 'book' },
  { href: '/event', label: 'Live event', icon: 'live' },
  { href: '/digest', label: 'Weekly digest', icon: 'chat' },
  { href: '/p/digest/eyJjaGlsZCI6ImFpc2hhLW5hbXV0ZWJpIiwid2VlayI6IjIwMjYtMTEtMDIiLCJleHAiOjE3OTQ4NjI3NDAwMDB9.demo-signature', route: 'p/digest/[token]', label: 'Parent Sunday digest', icon: 'chat' },
  { href: '/pay', label: 'Fee payment link', icon: 'wallet' },
  { href: '/pay/eyJpbnZvaWNlIjoiSU5WLTIwMjYtMDAwNDU4IiwiZXhwIjoxNzk0ODYyNzQwMDAwfQ.demo-signature', route: 'pay/[token]', label: 'One-tap checkout', icon: 'wallet' },
  { href: '/verify', label: 'Certificate check', icon: 'check' },
  { href: '/help', label: 'Help and status', icon: 'flag' },
  { href: '/get-started', label: 'Get-started wizard', icon: 'sparkle' },
  { href: '/qr-sign-in', label: 'Sign in with a QR code', icon: 'qr' },
  { href: '/qr-login', label: 'Classroom QR badge login', icon: 'qr' },
  { href: '/consent', label: 'Parent consent', icon: 'hand' },
  { href: '/guardian-consent', label: 'Ask a guardian (age gate)', icon: 'people' },
  { href: '/claim-child', label: 'Link your child', icon: 'people' },
  { href: '/pricing', label: 'Pricing', icon: 'wallet' },
  { href: '/curriculums', label: 'Curriculums', icon: 'map' },
  { href: '/teachers', label: 'For teachers', icon: 'cap' },
  { href: '/about', label: 'About Maple', icon: 'sparkle' },
  { href: '/terms', label: 'Terms of Service', icon: 'clipboard' },
  { href: '/privacy', label: 'Privacy Policy', icon: 'lock' },
] as const satisfies readonly { href: string; route?: string; label: string; icon: IconName }[];

/** Screens that open over any portal: reached from buttons, not a menu. */
export const SHARED_PREVIEWS = [
  { href: '/copilot', label: 'Ask Maple', icon: 'sparkle' },
  { href: '/report-concern', label: 'Report a concern', icon: 'flag' },
  { href: '/checkout', label: 'Checkout', icon: 'wallet' },
] as const satisfies readonly { href: string; label: string; icon: IconName }[];

/** The full-screen live classroom: signed-in only, outside the app shell so the lesson gets the whole screen. */
export const CLASSROOM = { href: '/classroom/p7-maths-revision-bootcamp', route: 'classroom/[slug]' } as const;

/** The sample one-tap checkout link that pay buttons open while the app runs on sample data. */
export const SAMPLE_CHECKOUT = PUBLIC_PREVIEWS.find((p) => p.label === 'One-tap checkout')?.href ?? '/pay';
