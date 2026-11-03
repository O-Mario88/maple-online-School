import { activeKey, navFor, portalsFor, PORTALS, CLASSROOM, type Person, PUBLIC_PREVIEWS, SHARED_PREVIEWS, tabBar } from './navigation';

const person = (role: string, memberships: { role: string; status?: string }[] = [], children = 0): Person => ({
  role,
  memberships: memberships.map((m) => ({ role: m.role, status: m.status ?? 'active' })),
  children: Array.from({ length: children }, (_, i) => ({ user_id: i + 1 })),
});

describe('portalsFor', () => {
  it('gives each account the portals its roles allow, main role first', () => {
    expect(portalsFor(person('student'))).toEqual(['learner']);
    expect(portalsFor(person('parent', [], 2))).toEqual(['parent']);
    expect(portalsFor(person('admin'))).toEqual(['command']);
    expect(portalsFor(person('teacher', [{ role: 'subject_teacher' }]))).toEqual(['teacher']);
  });

  it('adds the school portal for leaders and the bursar', () => {
    expect(portalsFor(person('teacher', [{ role: 'headteacher' }]))).toEqual(['school', 'teacher']);
    expect(portalsFor(person('teacher', [{ role: 'registrar' }]))).toEqual(['school', 'teacher']);
    expect(portalsFor(person('institution'))).toEqual(['school']);
  });

  it('adds the parent portal for staff who also have children', () => {
    expect(portalsFor(person('teacher', [{ role: 'class_teacher' }], 1))).toEqual(['teacher', 'parent']);
  });

  it('ignores memberships that are not active', () => {
    expect(portalsFor(person('teacher', [{ role: 'headteacher', status: 'suspended' }]))).toEqual(['teacher']);
  });
});

describe('navFor', () => {
  it.each(PORTALS)('%s starts with Home and has no duplicate items', (portal) => {
    for (const mock of [false, true]) {
      const items = navFor(portal, mock);
      expect(items[0].href).toBe('/');
      expect(new Set(items.map((i) => i.key)).size).toBe(items.length);
    }
  });

  it.each(PORTALS)('%s hides design-only screens unless mock data is on', (portal) => {
    expect(navFor(portal, false).some((i) => i.preview)).toBe(false);
    expect(navFor(portal, true).length).toBeGreaterThan(navFor(portal, false).length);
  });

  it('gives staff and families messages, but not learners', () => {
    expect(navFor('teacher').some((i) => i.href === '/messages')).toBe(true);
    expect(navFor('parent').some((i) => i.href === '/messages')).toBe(true);
    expect(navFor('learner', true).some((i) => i.href === '/messages')).toBe(false);
  });

  it('only shows school set-up to the school portal', () => {
    expect(navFor('school').some((i) => i.href === '/admin/onboarding')).toBe(true);
    expect(navFor('learner', true).some((i) => i.href === '/admin/onboarding')).toBe(false);
  });

  it('lets school admins reach every school-admin design page from the menu in a design build', () => {
    const hrefs = navFor('school', true).map((i) => i.href);
    for (const page of [
      '/admin/onboarding',
      '/admin/academics',
      '/admin/rosters',
      '/admin/timetable',
      '/admin/attendance',
      '/admin/scan',
      '/admin/report-cards',
      '/admin/library',
      '/admin/finance/fees',
      '/admin/finance/ledger',
      '/admin/finance/accounting',
      '/admin/finance/chart-of-accounts',
      '/admin/finance/journal-entries',
      '/admin/settings',
    ]) {
      expect(hrefs).toContain(page);
    }
  });

  it('lists the school-admin pages that run on the real API in a real build', () => {
    const hrefs = navFor('school', false).map((i) => i.href);
    for (const page of ['/admin/onboarding', '/admin/timetable', '/admin/report-cards', '/admin/attendance', '/admin/rosters', '/admin/academics', '/admin/finance/ledger']) {
      expect(hrefs).toContain(page);
    }
  });

  it('lets platform admins reach every Maple Command design page from the menu in a design build', () => {
    const hrefs = navFor('command', true).map((i) => i.href);
    for (const page of [
      '/command/overview',
      '/command/trust',
      '/command/trust-queue',
      '/command/institutions',
      '/command/curricula',
      '/command/finance/revenue',
      '/command/finance/payouts',
      '/command/finance/invoices',
      '/command/finance/tax',
      '/command/finance/subscriptions',
      '/command/finance/transactions',
      '/command/finance/settlements',
      '/command/finance/receivables',
      '/command/finance/revenue-recognition',
      '/command/finance/contracts',
      '/command/finance/teacher-payables',
      '/command/finance/expenses',
      '/command/finance/payroll',
      '/command/finance/accounting',
      '/command/finance/forecast',
      '/command/finance/reports',
      '/command/finance/profitability',
      '/command/finance/integrations',
      '/command/ops',
      '/command/security',
      '/command/security/audit-logs',
      '/command/security/data-requests',
      '/command/security/support',
      '/command/communications',
      '/command/communications/announcements',
      '/command/communications/broadcasts',
    ]) {
      expect(hrefs).toContain(page);
    }
    expect(navFor('command', false).some((i) => i.href.startsWith('/command/'))).toBe(false);
  });

  it('keeps the school menu of real builds on its live pages', () => {
    const hrefs = navFor('school', false).map((i) => i.href);
    expect(hrefs).toContain('/fees');
    expect(hrefs).toContain('/learn/library');
    // Fees and library open the live /fees and /learn/library pages; the accounting suite is design-only.
    const designOnly = ['/admin/finance/fees', '/admin/finance/accounting', '/admin/finance/chart-of-accounts', '/admin/finance/journal-entries', '/admin/library'];
    expect(hrefs.filter((h) => designOnly.includes(h))).toEqual([]);
  });

  it('sends learners to the designed pages once they run on the API, in every build', () => {
    const href = (mock: boolean, key: string) => navFor('learner', mock).find((i) => i.key === key)?.href;
    for (const mock of [true, false]) {
      expect(href(mock, 'assignments')).toBe('/learn/assignments');
      expect(href(mock, 'library')).toBe('/learn/library');
      expect(href(mock, 'lessons')).toBe('/learn/live');
    }
  });

  it('sends learners to the designed pages when mock data is on, and to the live pages otherwise', () => {
    const href = (mock: boolean, key: string) => navFor('learner', mock).find((i) => i.key === key)?.href;
    expect(href(true, 'lessons')).toBe('/learn/live');
    expect(href(true, 'library')).toBe('/learn/library');
    expect(href(true, 'projects')).toBe('/learn/projects');
    expect(href(true, 'exam')).toBe('/learn/paper');
  });

  it('keeps the learner phone tabs to Home, Learn, Classes and Assignments', () => {
    expect(tabBar(navFor('learner', true)).tabs.map((i) => i.label)).toEqual(['Home', 'Explore', 'Classes', 'Assignments']);
  });

  it('lights Classes and Library on both their designed and live pages', () => {
    const items = navFor('learner', true);
    expect(activeKey(items, '/learn/live')).toBe('lessons');
    expect(activeKey(items, '/learn/library')).toBe('library');
    expect(activeKey(items, '/learn/library/maths-olevel')).toBe('library');
  });

  // Every menu entry must open a real screen. (Jest runs in Node; the app has no Node types.)
  it.each(PORTALS)('every %s menu entry has a route file', (portal) => {
    /* eslint-disable @typescript-eslint/no-require-imports */
    const fs: { existsSync(p: string): boolean } = require('fs');
    const path: { join(...parts: string[]): string } = require('path');
    /* eslint-enable @typescript-eslint/no-require-imports */
    const app = path.join(dirname, '..', 'app', '(app)');
    for (const item of navFor(portal, true)) {
      const base = item.href === '/' ? 'index' : item.href.slice(1);
      const found = [`${base}.tsx`, path.join(base, 'index.tsx')].some((f) => fs.existsSync(path.join(app, f)));
      expect({ href: item.href, found }).toEqual({ href: item.href, found: true });
    }
  });
});

declare const __dirname: string;
const dirname = __dirname;

describe('tabBar', () => {
  const items = (n: number) => navFor('school', true).slice(0, n);

  it('shows every item when five or fewer fit', () => {
    expect(tabBar(items(5))).toEqual({ tabs: items(5), more: false });
  });

  it('shows four and a More tab when there are more', () => {
    expect(tabBar(items(7))).toEqual({ tabs: items(4), more: true });
  });
});

describe('activeKey', () => {
  const items = navFor('teacher');

  it('matches Home only on the root path', () => {
    expect(activeKey(items, '/')).toBe('home');
    expect(activeKey(items, '/learn/live')).toBe('lessons');
  });

  it('matches nested paths to their section', () => {
    expect(activeKey(items, '/learn/library/maths-olevel')).toBe('library');
  });

  it('lights Classes on the learner live hub, as the reference shows', () => {
    expect(activeKey(navFor('learner', true), '/learn/live')).toBe('lessons');
  });

  it('is undefined for screens outside the menu', () => {
    expect(activeKey(items, '/mark/3')).toBeUndefined();
  });

  // Public pages sit at the app root, outside the signed-in group, and the
  // root layout must not put them behind the sign-in guard.
  it('every public preview page has a root route the guard leaves open', () => {
    /* eslint-disable @typescript-eslint/no-require-imports */
    const fs: { existsSync(p: string): boolean; readFileSync(p: string, e: string): string } = require('fs');
    const path: { join(...parts: string[]): string } = require('path');
    /* eslint-enable @typescript-eslint/no-require-imports */
    const app = path.join(dirname, '..', 'app');
    const layout = fs.readFileSync(path.join(app, '_layout.tsx'), 'utf8');
    const guarded = layout.slice(layout.indexOf('<Stack.Protected'), layout.lastIndexOf('</Stack.Protected>'));
    expect(PUBLIC_PREVIEWS.length).toBeGreaterThan(0);
    for (const page of PUBLIC_PREVIEWS) {
      // A dynamic page names its route file, e.g. courses/[slug].
      const name = 'route' in page ? page.route : page.href.slice(1);
      expect({ name, found: fs.existsSync(path.join(app, `${name}.tsx`)) }).toEqual({ name, found: true });
      expect({ name, guarded: guarded.includes(`name="${name}"`) }).toEqual({ name, guarded: false });
      expect({ name, listed: layout.includes(`name="${name}"`) }).toEqual({ name, listed: true });
    }
  });

  // The AI helper, report-a-concern and checkout open over any portal, so they
  // live in the signed-in group rather than in one portal's menu.
  it.each(SHARED_PREVIEWS.map((p) => p.href))('shared screen %s has a signed-in route', (href) => {
    /* eslint-disable @typescript-eslint/no-require-imports */
    const fs: { existsSync(p: string): boolean } = require('fs');
    const path: { join(...parts: string[]): string } = require('path');
    /* eslint-enable @typescript-eslint/no-require-imports */
    expect(fs.existsSync(path.join(dirname, '..', 'app', '(app)', `${href.slice(1)}.tsx`))).toBe(true);
  });

  it('puts the full-screen classroom behind the sign-in guard', () => {
    /* eslint-disable @typescript-eslint/no-require-imports */
    const fs: { existsSync(p: string): boolean; readFileSync(p: string, e: string): string } = require('fs');
    const path: { join(...parts: string[]): string } = require('path');
    /* eslint-enable @typescript-eslint/no-require-imports */
    const app = path.join(dirname, '..', 'app');
    expect(fs.existsSync(path.join(app, `${CLASSROOM.route}.tsx`))).toBe(true);
    const layout = fs.readFileSync(path.join(app, '_layout.tsx'), 'utf8');
    const signedIn = layout.slice(layout.indexOf('<Stack.Protected guard={signedIn}>'), layout.indexOf('</Stack.Protected>'));
    expect(signedIn).toContain(`name="${CLASSROOM.route}"`);
  });
});
