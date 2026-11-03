import { type AttendanceSummary, attendanceSummary } from './attendance';
import type { Mark } from './types';

const MS_PER_DAY = 86_400_000;

/** A YYYY-MM-DD date moved by whole days (computed in UTC, so no time-zone drift). */
export function shiftDay(day: string, delta: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d) + delta * MS_PER_DAY).toISOString().slice(0, 10);
}

interface ClassRef {
  id: number;
  title: string;
}

export interface RegisteredClass extends ClassRef {
  summary: AttendanceSummary;
}

export interface UnexcusedAbsence {
  student: number;
  name: string;
  classId: number;
  classTitle: string;
}

export interface SchoolDay {
  registered: RegisteredClass[];
  missing: ClassRef[];
  totals: AttendanceSummary;
  unexcused: UnexcusedAbsence[];
}

/** One school day across every class: who took the register, the totals, and unexcused absences. */
export function schoolDay(classes: readonly ClassRef[], marksByClass: ReadonlyMap<number, readonly Mark[]>): SchoolDay {
  const marked = classes.filter((c) => (marksByClass.get(c.id) ?? []).length > 0);
  const all = marked.flatMap((c) => marksByClass.get(c.id) ?? []);
  return {
    registered: marked.map((c) => ({ id: c.id, title: c.title, summary: attendanceSummary(marksByClass.get(c.id) ?? []) })),
    missing: classes.filter((c) => !marked.includes(c)),
    totals: attendanceSummary(all),
    unexcused: marked.flatMap((c) =>
      (marksByClass.get(c.id) ?? [])
        .filter((m) => m.status === 'unauthorized_absent')
        .map((m) => ({ student: m.student, name: m.student_name, classId: c.id, classTitle: c.title })),
    ),
  };
}
