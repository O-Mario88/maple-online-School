/** Rules behind Maple Command › Communications: conversations, announcements and broadcasts. */

export interface Message {
  id: string;
  by: string;
  text: string;
  time: string;
  reactions: Readonly<Record<string, readonly string[]>>;
  mentions: readonly string[];
  file?: { name: string; size: string };
}

export interface Thread {
  id: string;
  name: string;
  kind: string;
  unread: number;
  mentions: number;
  archived: boolean;
  preview: string;
  time: string;
  messages: readonly Message[];
}

const MENTION = /@([A-Z][\w-]*)/g;

/** Post a message: it joins the thread, becomes its preview, and the thread counts as read. */
export function sendMessage<T extends Thread>(t: T, text: string, by: string, time: string): { thread: T; error?: string } {
  const body = text.trim();
  if (!body) return { thread: t, error: 'The message is empty.' };
  const mentions = [...body.matchAll(MENTION)].map((m) => m[1]);
  const message: Message = { id: `${t.id}-${t.messages.length + 1}`, by, text: body, time, reactions: {}, mentions };
  return { thread: { ...t, messages: [...t.messages, message], preview: `${by.split(' ')[0]}: ${body}`, time, unread: 0 } };
}

/** Add my reaction, or take it back if I already reacted with that emoji. */
export function toggleReaction<T extends Message>(m: T, emoji: string, me: string): T {
  const who = m.reactions[emoji] ?? [];
  const next = who.includes(me) ? who.filter((x) => x !== me) : [...who, me];
  return { ...m, reactions: { ...m.reactions, [emoji]: next } };
}

export type ThreadTab = 'All Messages' | 'Unread' | 'Mentions' | 'Announcements' | 'Broadcasts' | 'Archived';

export function filterThreads<T extends Thread>(list: readonly T[], tab: ThreadTab, query: string): readonly T[] {
  const q = query.trim().toLowerCase();
  return list.filter((t) => {
    const inTab =
      tab === 'Archived'
        ? t.archived
        : !t.archived &&
          (tab === 'All Messages' || (tab === 'Unread' && t.unread > 0) || (tab === 'Mentions' && t.mentions > 0) || (tab === 'Announcements' && t.kind === 'System Broadcast') || (tab === 'Broadcasts' && t.kind === 'Broadcast'));
    return inTab && (!q || `${t.name} ${t.preview} ${t.kind}`.toLowerCase().includes(q));
  });
}

/* ─── Announcements ─── */

export type AnnouncementStatus = 'Draft' | 'Scheduled' | 'Published' | 'Archived';

export interface Announcement {
  id: string;
  title: string;
  status: AnnouncementStatus;
  publishedAt?: string;
  scheduledFor?: string;
}

export function publish<T extends Announcement>(a: T, at: string): T {
  return { ...a, status: 'Published', publishedAt: at };
}

/** Schedule for later; the time must be after now. */
export function schedule<T extends Announcement>(a: T, at: string, now: string): { announcement: T; error?: string } {
  if (Date.parse(at) <= Date.parse(now)) return { announcement: a, error: 'Pick a time in the future.' };
  return { announcement: { ...a, status: 'Scheduled', scheduledFor: at } };
}

export function archive<T extends Announcement>(a: T): T {
  return { ...a, status: 'Archived' };
}

/** A draft copy to edit and send again. */
export function duplicate<T extends Announcement>(a: T, id: string): T {
  return { ...a, id, title: `${a.title} (Copy)`, status: 'Draft', publishedAt: undefined, scheduledFor: undefined };
}

/* ─── Broadcasts ─── */

export type Group = 'Students' | 'Parents' | 'Teachers' | 'School Administrators';

export interface BroadcastForm {
  audience: 'All Users' | 'Specific Groups' | 'Specific Schools';
  groups: readonly Group[];
  schools: readonly string[];
  title: string;
  content: string;
  channels: readonly string[];
  when: 'now' | 'later';
  at?: string;
}

/** Everything a broadcast still needs before it can go out, in form order. */
export function validateBroadcast(f: BroadcastForm, now: string): readonly string[] {
  const errors: string[] = [];
  if (f.audience === 'Specific Groups' && !f.groups.length) errors.push('Pick at least one group.');
  if (f.audience === 'Specific Schools' && !f.schools.length) errors.push('Pick at least one school.');
  if (!f.title.trim()) errors.push('Add a title.');
  if (!f.content.trim()) errors.push('Write the message.');
  if (!f.channels.length) errors.push('Choose at least one channel.');
  if (f.when === 'later' && (!f.at || Date.parse(f.at) <= Date.parse(now))) errors.push('Pick a time in the future.');
  return errors;
}

const SMS_LENGTH = 160;

/** How many SMS messages the text takes. */
export function smsSegments(text: string): number {
  return Math.max(1, Math.ceil(text.length / SMS_LENGTH));
}

/** People the broadcast would reach, from the audience sizes. A school averages 120 people. */
const PER_SCHOOL = 120;

export function reachEstimate(f: BroadcastForm, sizes: Readonly<Record<Group, number>>): number {
  if (f.audience === 'All Users') return Object.values(sizes).reduce((s, n) => s + n, 0);
  if (f.audience === 'Specific Groups') return f.groups.reduce((s, g) => s + (sizes[g] ?? 0), 0);
  return f.schools.length * PER_SCHOOL;
}
