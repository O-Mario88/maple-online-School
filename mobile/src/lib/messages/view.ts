/**
 * What the Messages page shows: folders, search, and the dates beside conversations and messages.
 * Unread and starred are kept on this device for now (the API has neither yet).
 */
import type { Thread, ThreadSummary } from './queries';

export type Folder = 'all' | 'unread' | 'starred' | 'academic' | 'admissions' | 'events' | 'announcements' | 'archived';

/** The folder rail, in the design's order. The topic folders fill once conversations carry a topic. */
export const FOLDERS: readonly { key: Folder; label: string }[] = [
  { key: 'all', label: 'All Messages' },
  { key: 'unread', label: 'Unread' },
  { key: 'starred', label: 'Starred' },
  { key: 'academic', label: 'Academic' },
  { key: 'admissions', label: 'Admissions' },
  { key: 'events', label: 'Events' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'archived', label: 'Archived' },
];

/** When each conversation was last opened here, and which ones are starred. */
export interface Marks {
  readonly seen: Readonly<Record<number, string>>;
  readonly starred: readonly number[];
}

export const NO_MARKS: Marks = { seen: {}, starred: [] };

export function markSeen(marks: Marks, id: number, at: string): Marks {
  return { ...marks, seen: { ...marks.seen, [id]: at } };
}

export function toggleStar(marks: Marks, id: number): Marks {
  const on = marks.starred.includes(id);
  return { ...marks, starred: on ? marks.starred.filter((s) => s !== id) : [...marks.starred, id] };
}

function isUnread(t: ThreadSummary, marks: Marks, me: string): boolean {
  if (!t.last_author || t.last_author === me) return false;
  const seen = marks.seen[t.id];
  return !seen || new Date(seen).getTime() < new Date(t.last_message_at).getTime();
}

export function inFolder(t: ThreadSummary, folder: Folder, marks: Marks, me: string): boolean {
  if (folder === 'all') return true;
  if (folder === 'unread') return isUnread(t, marks, me);
  if (folder === 'starred') return marks.starred.includes(t.id);
  // Topics and the archive need fields the API doesn't send yet.
  return false;
}

export function folderCount(threads: readonly ThreadSummary[], folder: Folder, marks: Marks, me: string): number {
  return threads.filter((t) => inFolder(t, folder, marks, me)).length;
}

/** A search over the subject, the learner, the staff member and the last message. */
export function matches(t: ThreadSummary, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [t.subject, t.student.name, t.staff.name, t.last_body, t.last_author].some((s) => s.toLowerCase().includes(q));
}

const CLOCK = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
const MONTH_DAY = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const FULL_DAY = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "9:24 AM" */
export function clock(iso: string): string {
  return CLOCK.format(new Date(iso));
}

/** "Oct 26, 2026" */
export function dayLabel(iso: string): string {
  return FULL_DAY.format(new Date(iso));
}

/** The date beside a conversation: its time today, else "Oct 26", with the year when it isn't this one. */
export function listDate(iso: string, now: Date): string {
  const d = new Date(iso);
  if (sameDay(d, now)) return clock(iso);
  return d.getFullYear() === now.getFullYear() ? MONTH_DAY.format(d) : FULL_DAY.format(d);
}

/** True when a server response is a whole conversation (a reply returns one), not a bare acknowledgement. */
export function isThread(value: unknown): value is Thread {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as { id?: unknown; messages?: unknown };
  return typeof v.id === 'number' && Array.isArray(v.messages);
}

type Message = Thread['messages'][number];

/** A conversation's messages under one heading per day. */
export function byDay(messages: readonly Message[]): { key: string; label: string; messages: Message[] }[] {
  return messages.reduce<{ key: string; label: string; messages: Message[] }[]>((days, m) => {
    const label = dayLabel(m.created_at);
    const last = days[days.length - 1];
    if (last && last.label === label) return [...days.slice(0, -1), { ...last, messages: [...last.messages, m] }];
    return [...days, { key: `${label}-${m.id}`, label, messages: [m] }];
  }, []);
}
