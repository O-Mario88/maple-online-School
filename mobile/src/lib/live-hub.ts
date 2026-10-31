/**
 * Rules for the learner's live schedule: calendar days as 'YYYY-MM-DD' keys (no time zones),
 * 24-hour 'HH:MM' times, and what each session's button should offer.
 */

export type SessionAction = 'join' | 'soon' | 'later' | 'ended';
export type SessionKind = 'school' | 'bootcamp' | 'tutor';
export type DayDot = 'missed' | 'school' | 'bootcamp' | 'none';

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;
/** A session starting within two hours counts as "soon". */
const SOON_MINUTES = 120;
const DAY_MS = 86_400_000;

const toUTC = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
const toKey = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const minutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};
/** Monday is 0. */
const weekday = (key: string) => (new Date(toUTC(key)).getUTCDay() + 6) % 7;

export function addDays(key: string, n: number): string {
  return toKey(toUTC(key) + n * DAY_MS);
}

/** A time of day some minutes later, within the same day. */
export function addMinutes(time: string, n: number): string {
  const t = Math.min(24 * 60 - 1, minutes(time) + n);
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

/** The first day of the month n months away. */
export function addMonths(key: string, n: number): string {
  const [y, m] = key.split('-').map(Number);
  return toKey(Date.UTC(y, m - 1 + n, 1));
}

/** The Monday-to-Sunday week that holds the day. */
export function weekOf(key: string): string[] {
  const monday = addDays(key, -weekday(key));
  return DOW.map((_, i) => addDays(monday, i));
}

export function dayParts(key: string): { dow: string; date: number; long: string } {
  const date = Number(key.slice(8, 10));
  const month = MONTHS[Number(key.slice(5, 7)) - 1].slice(0, 3);
  const dow = DOW[weekday(key)];
  return { dow, date, long: `${dow} ${date} ${month}` };
}

export function monthTitle(key: string): string {
  return `${MONTHS[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`;
}

/** The month as Monday-first weeks; days outside the month are null. */
export function monthWeeks(key: string): (string | null)[][] {
  const first = `${key.slice(0, 8)}01`;
  const days: string[] = [];
  for (let d = first; d.slice(0, 7) === first.slice(0, 7); d = addDays(d, 1)) days.push(d);
  const cells = [...Array<null>(weekday(first)).fill(null), ...days];
  const padded = [...cells, ...Array<null>((7 - (cells.length % 7)) % 7).fill(null)];
  return Array.from({ length: padded.length / 7 }, (_, w) => padded.slice(w * 7, w * 7 + 7));
}

export function clock12(time: string): string {
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

/** Join while it runs, "soon" inside two hours, "later" beyond that, "ended" once over. */
export function sessionAction(s: { day: string; start: string; end: string }, now: { day: string; time: string }): SessionAction {
  const at = (day: string, time: string) => toUTC(day) / 60_000 + minutes(time);
  const t = at(now.day, now.time);
  if (t >= at(s.day, s.end)) return 'ended';
  if (t >= at(s.day, s.start)) return 'join';
  return at(s.day, s.start) - t <= SOON_MINUTES ? 'soon' : 'later';
}

/** The dot under a calendar day: a missed class first, then school classes, then bootcamps and tutors. */
export function dayDot(sessions: readonly { kind: SessionKind; attended?: boolean }[], past: boolean): DayDot {
  if (past && sessions.some((s) => s.attended === false)) return 'missed';
  if (sessions.some((s) => s.kind === 'school')) return 'school';
  return sessions.length > 0 ? 'bootcamp' : 'none';
}
