import type { components } from '@/lib/api/schema';

export type Notification = components['schemas']['Notification'];

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "Just now", "5 min ago", "3 h ago", "Yesterday", then a date. */
export function timeAgo(iso: string, now: Date): string {
  const then = new Date(iso);
  const diff = now.getTime() - then.getTime();
  if (diff < MINUTE) return 'Just now';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} min ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} h ago`;
  if (diff < 2 * DAY) return 'Yesterday';
  return then.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/** Notification links are app paths; anything else opens Home. */
export function appLink(link: string): string {
  return /^\/(?!\/)[\w\-/?=&.]*$/.test(link) ? link : '/';
}
