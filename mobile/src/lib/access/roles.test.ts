import { canOpen, type Who } from './roles';

const who = (portals: Who['portals'], schoolRoles: string[] = [], institution = false): Who => ({ portals, schoolRoles, institution });
const learner = who(['learner']);
const teacher = who(['teacher'], ['subject_teacher']);
const bursar = who(['school', 'teacher'], ['registrar']);
const head = who(['school', 'teacher'], ['headteacher']);
const classTeacher = who(['school', 'teacher'], ['class_teacher']);

describe('which pages a role may open', () => {
  test('each portal’s own area is closed to accounts without that portal', () => {
    expect(canOpen('/learn/plan', learner)).toBe(true);
    expect(canOpen('/teach/studio', learner)).toBe(false);
    expect(canOpen('/admin/rosters', learner)).toBe(false);
    expect(canOpen('/family/attendance', learner)).toBe(false);
    expect(canOpen('/command/overview', head)).toBe(false);
    expect(canOpen('/command/overview', who(['command']))).toBe(true);
    expect(canOpen('/learn/plan', teacher)).toBe(false);
  });

  test('shared pages open for everyone: classes, the library, messages, home', () => {
    for (const path of ['/', '/learn/live', '/learn/library', '/learn/library/maths', '/messages', '/inbox']) {
      expect(canOpen(path, teacher)).toBe(true);
      expect(canOpen(path, who(['parent']))).toBe(true);
    }
  });

  test('school pages follow the API’s role groups', () => {
    expect(canOpen('/admin/finance/fees', bursar)).toBe(true);
    expect(canOpen('/admin/finance/fees', classTeacher)).toBe(false);
    expect(canOpen('/admin/subscription', head)).toBe(true);
    expect(canOpen('/admin/subscription', classTeacher)).toBe(false);
    expect(canOpen('/admin/admissions', bursar)).toBe(true);
    expect(canOpen('/admin/settings', bursar)).toBe(false);
    expect(canOpen('/admin/settings', head)).toBe(true);
    expect(canOpen('/admin/rosters', classTeacher)).toBe(true);
  });

  test('the school’s own account opens every school page', () => {
    expect(canOpen('/admin/finance/ledger', who(['school'], [], true))).toBe(true);
    expect(canOpen('/admin/settings', who(['school'], [], true))).toBe(true);
  });
});
