import type { Mark, MarkStatus } from './types';

export interface AttendanceSummary {
  days: number;
  present: number;
  late: number;
  absent: number;
  /** Share of recorded days the learner was in school (present or late), 0–100. */
  rate: number | null;
}

export function attendanceSummary(marks: readonly Mark[]): AttendanceSummary {
  const present = marks.filter((m) => m.status === 'present').length;
  const late = marks.filter((m) => m.status === 'late').length;
  const absent = marks.length - present - late;
  const rate = marks.length === 0 ? null : Math.round(((present + late) / marks.length) * 100);
  return { days: marks.length, present, late, absent, rate };
}

export type Register = Record<number, MarkStatus>;

/** Starting state for taking a register: today's saved marks, else everyone present. */
export function initialRegister(roster: readonly { student: number }[], today: readonly Mark[]): Register {
  const saved = new Map(today.map((m) => [m.student, m.status]));
  return Object.fromEntries(roster.map((r) => [r.student, saved.get(r.student) ?? 'present']));
}

export const STATUS_LABELS: Record<MarkStatus, string> = {
  present: 'Present',
  late: 'Late',
  authorized_absent: 'Absent (excused)',
  unauthorized_absent: 'Absent',
};

/** The order a tap cycles through when marking a student. */
export const STATUS_CYCLE: MarkStatus[] = ['present', 'late', 'unauthorized_absent', 'authorized_absent'];

export function nextStatus(current: MarkStatus): MarkStatus {
  return STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length];
}

/** Today's date as YYYY-MM-DD in the device's time zone. */
export function localToday(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
