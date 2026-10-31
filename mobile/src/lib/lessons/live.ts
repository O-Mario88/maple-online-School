import type { components } from '@/lib/api/schema';

export type LiveSession = components['schemas']['LiveSession'];

/** The meeting opens this long before the start. */
const JOIN_EARLY_MS = 15 * 60_000;

type SessionLike = Pick<LiveSession, 'status' | 'scheduled_start' | 'duration_minutes' | 'meeting_link' | 'replay_url'>;

export type LiveAction =
  | { kind: 'join'; href: string }
  | { kind: 'replay'; href: string }
  | { kind: 'wait' }
  | { kind: 'ended' }
  | { kind: 'cancelled' };

/** What a person can do with a session right now. */
export function liveAction(s: SessionLike, now: Date): LiveAction {
  if (s.status === 'cancelled') return { kind: 'cancelled' };
  if (s.replay_url) return { kind: 'replay', href: s.replay_url };
  if (s.status === 'completed' || !s.scheduled_start) return { kind: s.status === 'completed' ? 'ended' : 'wait' };
  const start = new Date(s.scheduled_start).getTime();
  const end = start + s.duration_minutes * 60_000;
  const t = now.getTime();
  if (t < start - JOIN_EARLY_MS) return { kind: 'wait' };
  if (t <= end) return { kind: 'join', href: s.meeting_link };
  return { kind: 'ended' };
}

/** The provider for a pasted meeting link, or null if it isn't Meet or Zoom. */
export function providerFor(link: string): 'google_meet' | 'zoom' | null {
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  const host = url.hostname.toLowerCase();
  if (host === 'meet.google.com') return 'google_meet';
  if (host === 'zoom.us' || host.endsWith('.zoom.us')) return 'zoom';
  return null;
}

export interface SessionGroups<T> {
  /** Joinable now. */
  live: T[];
  /** Not open yet, soonest first. */
  upcoming: T[];
  /** Over, with or without a replay. Cancelled sessions are left out. */
  past: T[];
}

/** Sorts sessions into what's live now, what's coming up and what's over. */
export function groupSessions<T extends SessionLike>(sessions: readonly T[], now: Date): SessionGroups<T> {
  const groups: SessionGroups<T> = { live: [], upcoming: [], past: [] };
  for (const s of sessions) {
    const kind = liveAction(s, now).kind;
    if (kind === 'join') groups.live.push(s);
    else if (kind === 'wait') groups.upcoming.push(s);
    else if (kind !== 'cancelled') groups.past.push(s);
  }
  const startOf = (s: T) => (s.scheduled_start ? new Date(s.scheduled_start).getTime() : Number.MAX_SAFE_INTEGER);
  groups.upcoming.sort((a, b) => startOf(a) - startOf(b));
  return groups;
}
