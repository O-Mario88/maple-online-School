import { activeKey, navFor, portalsFor, PORTALS, type Person } from './navigation';

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
  it.each(PORTALS)('%s keeps at most five items in the phone tab bar, starting with Home', (portal) => {
    const items = navFor(portal);
    expect(items[0].href).toBe('/');
    expect(items.filter((i) => i.primary).length).toBeLessThanOrEqual(5);
    expect(new Set(items.map((i) => i.key)).size).toBe(items.length);
  });

  it('only shows school set-up to the school portal', () => {
    expect(navFor('school').some((i) => i.href === '/school')).toBe(true);
    expect(navFor('learner').some((i) => i.href === '/school')).toBe(false);
  });
});

describe('activeKey', () => {
  const items = navFor('teacher');

  it('matches Home only on the root path', () => {
    expect(activeKey(items, '/')).toBe('home');
    expect(activeKey(items, '/lessons')).toBe('lessons');
  });

  it('matches nested paths to their section', () => {
    expect(activeKey(items, '/library/items/4')).toBe('library');
  });

  it('is undefined for screens outside the menu', () => {
    expect(activeKey(items, '/mark/3')).toBeUndefined();
  });
});
