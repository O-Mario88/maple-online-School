/** Rules for a public live class page: the countdown, the seat counter and the add-to-calendar link. */

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Below this share of seats left, the page warns "Only N seats left". */
const LOW_SEATS_SHARE = 0.25;

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  started: boolean;
}

/** Time from `now` until `start` (both in milliseconds), split for the countdown. */
export function timeLeft(start: number, now: number): TimeLeft {
  const ms = start - now;
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, started: true };
  return {
    days: Math.floor(ms / DAY),
    hours: Math.floor((ms % DAY) / HOUR),
    minutes: Math.floor((ms % HOUR) / MINUTE),
    seconds: Math.floor((ms % MINUTE) / SECOND),
    started: false,
  };
}

/** Seats left, the share booked (0 to 1), whether to warn, and whether it's full. */
export function seatsLeft(booked: number, capacity: number): { left: number; booked: number; low: boolean; full: boolean } {
  const left = Math.max(capacity - booked, 0);
  return { left, booked: capacity > 0 ? Math.min(booked / capacity, 1) : 1, low: left <= capacity * LOW_SEATS_SHARE, full: left === 0 };
}

function utcStamp(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** A Google Calendar "add event" link for the session. */
export function calendarLink(e: { title: string; start: number; minutes: number; details: string }): string {
  const dates = `${utcStamp(e.start)}/${utcStamp(e.start + e.minutes * MINUTE)}`;
  const q = [`text=${encodeURIComponent(e.title)}`, `dates=${encodeURIComponent(dates)}`, `details=${encodeURIComponent(e.details)}`];
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&${q.join('&')}`;
}
