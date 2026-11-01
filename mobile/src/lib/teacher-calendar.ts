/** Pure helpers behind the teacher zero-collision calendar (kept here so Jest can test them). */

export type CalendarCategory = 'school' | 'tutoring' | 'instant' | 'tasks' | 'content' | 'external';

export interface CalendarSlot {
  id: string;
  day: number;
  /** 24-hour start time, e.g. 8 for 8:00 AM, 13.5 for 1:30 PM. */
  start: number;
  /** Duration in hours, e.g. 1 for 60 min, 0.75 for 45 min. */
  duration: number;
  timeLabel: string;
  title: string;
  subtitle?: string;
  phoneTitle?: string;
  phoneTime?: string;
  category: CalendarCategory;
}

/** Formats a 24-hour number (8..20) as "8:00 AM", "12:00 PM", "1:00 PM". */
/** Hours in a duration picker label: "45 mins" → 0.75, "1.5 hours" → 1.5; one hour when unreadable. */
export function durationHours(label: string): number {
  const m = /^(\d+(?:\.\d+)?)\s*(min|hour)/i.exec(label.trim());
  if (!m) return 1;
  const n = Number(m[1]);
  return m[2].toLowerCase() === 'min' ? n / 60 : n;
}

export function formatHourLabel(hour24: number): string {
  const whole = Math.floor(hour24);
  const mins = Math.round((hour24 - whole) * 60);
  const suffix = whole >= 12 ? 'PM' : 'AM';
  const hour12 = whole % 12 === 0 ? 12 : whole % 12;
  const mm = String(mins).padStart(2, '0');
  return `${hour12}:${mm} ${suffix}`;
}

/** Filters events by the currently checked category filters and whether Instant Help is enabled. */
export function filterCalendarEvents<T extends CalendarSlot>(
  events: readonly T[],
  enabled: Readonly<Record<CalendarCategory, boolean>>,
): T[] {
  return events.filter((e) => enabled[e.category]);
}

/** Returns the first existing event on the same day that overlaps [start, start + duration), or null when free. */
export function findCollision<T extends CalendarSlot>(
  events: readonly T[],
  day: number,
  start: number,
  duration: number,
): T | null {
  const end = start + duration;
  return (
    events.find((e) => {
      if (e.day !== day) return false;
      const eEnd = e.start + e.duration;
      return start < eEnd && end > e.start;
    }) ?? null
  );
}

/** Suggests up to `count` clash-free 1-hour slots across Mon–Sat between 8:00 AM and 7:00 PM. */
export function suggestFreeSlots(
  events: readonly CalendarSlot[],
  dayLabels: readonly string[],
  preferredDay: number,
  duration = 1,
  count = 3,
): { day: number; start: number; label: string }[] {
  const out: { day: number; start: number; label: string }[] = [];
  const daysOrder = [preferredDay, ...dayLabels.map((_, i) => i).filter((i) => i !== preferredDay && i < 6)];
  const candidateHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  for (const d of daysOrder) {
    for (const h of candidateHours) {
      if (findCollision(events, d, h, duration) === null) {
        out.push({ day: d, start: h, label: `${dayLabels[d] ?? 'Day'} · ${formatHourLabel(h)}` });
        if (out.length >= count) return out;
      }
    }
  }
  return out;
}

