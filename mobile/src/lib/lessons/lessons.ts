import type { components } from '@/lib/api/schema';

export type Lesson = components['schemas']['Lesson'];

/** Today's and later lessons, earliest first. Today's earlier lessons stay listed. */
export function upcomingLessons<T extends { scheduled_at: string }>(lessons: readonly T[], now: Date): T[] {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  // filter() returns a fresh array, so sorting it in place leaves the input alone.
  // (Array.toSorted is missing on the phones' JavaScript engine.)
  return lessons
    .filter((l) => new Date(l.scheduled_at).getTime() >= startOfToday)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
}

export interface Parsed {
  value: string | null;
  error: string | null;
}

/** Turns the form's local date (YYYY-MM-DD) and time (HH:MM) into an ISO timestamp. */
export function parseLessonTime(date: string, time: string): Parsed {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  if (!d) return { value: null, error: 'Write the date as YYYY-MM-DD.' };
  const t = /^(\d{2}):(\d{2})$/.exec(time.trim());
  if (!t) return { value: null, error: 'Write the time as HH:MM, for example 09:30.' };
  const [year, month, day, hour, minute] = [d[1], d[2], d[3], t[1], t[2]].map(Number);
  const when = new Date(year, month - 1, day, hour, minute);
  const sameDay = when.getFullYear() === year && when.getMonth() === month - 1 && when.getDate() === day;
  if (!sameDay || hour > 23 || minute > 59) return { value: null, error: 'That date or time does not exist.' };
  return { value: when.toISOString(), error: null };
}

/** A short local label such as "Mon 2 Nov, 09:30". */
export function lessonWhen(iso: string): string {
  const when = new Date(iso);
  const day = when.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  const time = when.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${day}, ${time}`;
}
