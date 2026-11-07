/**
 * Rules behind My Plan's Goals & Milestones, Study Schedule and Recommendations tabs: goal
 * statuses, weeks to go, subject focus, study time per day and week, the week shown, and the
 * calendar file the schedule exports to.
 */

export type GoalStatus = 'Completed' | 'In progress' | 'Not started';

export const goalStatus = (g: { done: boolean; progress: number }): GoalStatus =>
  g.done ? 'Completed' : g.progress > 0 ? 'In progress' : 'Not started';

export function goalCounts(goals: readonly { done: boolean; progress: number }[]) {
  const by = (s: GoalStatus) => goals.filter((g) => goalStatus(g) === s).length;
  return { completed: by('Completed'), inProgress: by('In progress'), notStarted: by('Not started') };
}

export const weeksToGo = (endWeek: number, week: number) => Math.max(0, endWeek - week);

/** Below this a subject needs attention; below the next, it can improve further. */
const ATTENTION = 0.6;
const IMPROVE = 0.7;
export const focusLabel = (progress: number) =>
  progress < ATTENTION ? 'Needs Attention' : progress < IMPROVE ? 'Improve Further' : 'Keep Building';

export interface Session {
  day: string;
  /** "HH:MM", 24-hour. */
  start: string;
  end: string;
  subject: string;
  topic: string;
  kind: 'study' | 'break';
}

const minutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
export const sessionMinutes = (s: Session) => minutes(s.end) - minutes(s.start);

/** Study minutes on a day (breaks don't count). */
export const dayTotal = (sessions: readonly Session[], day: string) =>
  sessions.filter((s) => s.day === day && s.kind === 'study').reduce((n, s) => n + sessionMinutes(s), 0);

export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

/** Study minutes per subject for the week, biggest first, each with its whole-percent share. */
export function weeklyBreakdown(sessions: readonly Session[]) {
  const study = sessions.filter((s) => s.kind === 'study');
  const total = study.reduce((n, s) => n + sessionMinutes(s), 0);
  const by = new Map<string, number>();
  study.forEach((s) => by.set(s.subject, (by.get(s.subject) ?? 0) + sessionMinutes(s)));
  const subjects = [...by.entries()]
    .map(([subject, m]) => ({ subject, minutes: m, share: total ? Math.round((m / total) * 100) : 0 }))
    .sort((a, b) => b.minutes - a.minutes);
  return { total, subjects };
}

const DAY_MS = 86_400_000;
const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const short = (d: Date, day: string) => `${day} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;

/** The Monday-to-Sunday week around a date, moved by `offset` weeks. */
export function weekRange(today: string, offset: number) {
  const t = parse(today);
  const monday = new Date(t.getTime() - ((t.getUTCDay() + 6) % 7) * DAY_MS + offset * 7 * DAY_MS);
  const days = Array.from({ length: 7 }, (_, i) => iso(new Date(monday.getTime() + i * DAY_MS)));
  const sunday = parse(days[6]);
  return { start: days[0], end: days[6], label: `${short(monday, 'Mon')} – ${short(sunday, 'Sun')}`, days };
}

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** The week's study sessions as a calendar file (local times), for Export Schedule. */
export function scheduleIcs(sessions: readonly Session[], weekStart: string): string {
  const { days } = weekRange(weekStart, 0);
  const stamp = (date: string, t: string) => `${date.replace(/-/g, '')}T${t.replace(':', '')}00`;
  const events = sessions
    .filter((s) => s.kind === 'study')
    .map((s, i) => {
      const date = days[WEEKDAYS.indexOf(s.day as (typeof WEEKDAYS)[number])];
      return [
        'BEGIN:VEVENT',
        `UID:maple-${weekStart}-${i}@maple`,
        `DTSTART:${stamp(date, s.start)}`,
        `DTEND:${stamp(date, s.end)}`,
        `SUMMARY:${s.subject}: ${s.topic}`,
        'END:VEVENT',
      ].join('\r\n');
    });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Maple//Study Schedule//EN', ...events, 'END:VCALENDAR'].join('\r\n');
}

/** The exported calendar file's name, from the Monday its week starts on (YYYY-MM-DD). */
export const calendarFileName = (weekStart: string) => `maple-study-schedule-${weekStart}.ics`;
