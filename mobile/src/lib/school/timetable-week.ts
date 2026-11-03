import type { Slot, Term } from './types';

/** The timetable API counts Monday as 0. */
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const WEEKDAYS = 5;

export interface TimetableDay {
  day: number;
  name: (typeof DAY_NAMES)[number];
  lessons: Slot[];
}

/** Monday to Friday always, plus a weekend day when a lesson falls on it; each day's lessons in time order. */
export function weekDays(slots: readonly Slot[]): TimetableDay[] {
  return DAY_NAMES.map((name, day) => ({
    day,
    name,
    lessons: slots.filter((s) => s.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time)),
  })).filter((d) => d.day < WEEKDAYS || d.lessons.length > 0);
}

const CLOCK = /^([01]?\d|2[0-3]):([0-5]\d)$/;

/** "8:05" becomes "08:05"; anything that isn't a 24-hour clock time is null. */
export function normalizeTime(text: string): string | null {
  const m = CLOCK.exec(text.trim());
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : null;
}

/** Why a lesson's times can't be saved, or null when they can. */
export function lessonTimeProblem(start: string, end: string): string | null {
  const from = normalizeTime(start);
  const to = normalizeTime(end);
  if (!from || !to) return 'Enter the start and end as times like 08:00.';
  if (to <= from) return 'The lesson must end after it starts.';
  return null;
}

/** The term to show first: the active one, otherwise the one that starts last. */
export function pickTerm(terms: readonly Term[]): Term | null {
  const active = terms.find((t) => t.is_active);
  if (active) return active;
  return [...terms].sort((a, b) => b.start_date.localeCompare(a.start_date))[0] ?? null;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Why a new term can't be saved, or null when it can. */
export function termProblem(name: string, start: string, end: string): string | null {
  if (!name.trim()) return 'Give the term a name, such as Term 1 2027.';
  if (!DATE.test(start.trim()) || !DATE.test(end.trim())) return 'Enter dates like 2027-02-01.';
  if (end.trim() <= start.trim()) return 'The term must end after it starts.';
  return null;
}
