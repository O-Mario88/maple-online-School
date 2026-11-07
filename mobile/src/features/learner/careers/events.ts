/**
 * Career Events rules: which events show (upcoming only), the tab counts, the order, and the month
 * calendar. Registering for an institution's event shares only what the learner agrees to.
 */
import { daysBetween } from './dates';

export const EVENT_KINDS = [
  { kind: 'Open Day', plural: 'Open Days', icon: 'building' },
  { kind: 'Career Talk', plural: 'Career Talks', icon: 'mic' },
  { kind: 'Career Fair', plural: 'Career Fairs', icon: 'campus' },
  { kind: 'Group Guidance', plural: 'Group Guidance', icon: 'people' },
] as const;

export interface EventFilters {
  kind: string;
  format: string;
  area: string;
  level: string;
  /** 'all' | 'month' (next 30 days) | 'quarter' (next 90 days) */
  dates: string;
}
export const NO_EVENT_FILTERS: EventFilters = { kind: 'all', format: 'all', area: 'all', level: 'all', dates: 'all' };
const WINDOW = { month: 30, quarter: 90 } as const;

interface Ev {
  date: string;
  title: string;
  kind: string;
  format: string;
  area: string | null;
  levels: readonly string[];
}

export function filterEvents<T extends Ev>(events: readonly T[], f: EventFilters, today: string): T[] {
  return events.filter((e) => {
    const ahead = daysBetween(today, e.date);
    if (ahead < 0) return false;
    if (f.dates !== 'all' && ahead > WINDOW[f.dates as keyof typeof WINDOW]) return false;
    // An event with no area is open to every area.
    return (f.kind === 'all' || e.kind === f.kind) && (f.format === 'all' || e.format === f.format) && (f.area === 'all' || !e.area || e.area === f.area) && (f.level === 'all' || e.levels.includes(f.level));
  });
}

/** Counts for the kind tabs: every other filter applies, the kind doesn't. */
export function kindCounts(events: readonly Ev[], f: EventFilters, today: string): Record<string, number> {
  const base = filterEvents(events, { ...f, kind: 'all' }, today);
  return Object.fromEntries([['all', base.length], ...EVENT_KINDS.map((k) => [k.kind, base.filter((e) => e.kind === k.kind).length])]);
}

export function sortEvents<T extends Ev>(events: readonly T[], sort: 'soonest' | 'az'): T[] {
  return [...events].sort((a, b) => (sort === 'az' ? a.title.localeCompare(b.title) : a.date.localeCompare(b.date)));
}

const pad = (n: number) => String(n).padStart(2, '0');

/** A month as Monday-first weeks, padded with the neighbouring months' days. */
export function monthGrid(year: number, month: number): { iso: string; day: number; inMonth: boolean }[][] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const daysIn = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells = Math.ceil((lead + daysIn) / 7) * 7;
  const days = Array.from({ length: cells }, (_, i) => {
    const d = new Date(Date.UTC(year, month - 1, 1 - lead + i));
    return { iso: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`, day: d.getUTCDate(), inMonth: d.getUTCMonth() === month - 1 };
  });
  return Array.from({ length: cells / 7 }, (_, w) => days.slice(w * 7, w * 7 + 7));
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const i = year * 12 + (month - 1) + delta;
  return { year: Math.floor(i / 12), month: (i % 12) + 1 };
}
