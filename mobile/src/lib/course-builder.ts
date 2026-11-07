/** Helpers behind the course builder (kept here so Jest can test them). */

const MMSS = /^(\d{1,3}):([0-5]\d)$/;

/** "05:10" → 310 seconds; null when the text isn't minutes:seconds. */
export function parseTimestamp(text: string): number | null {
  const m = MMSS.exec(text.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** 310 → "05:10". */
export function formatTimestamp(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(whole / 60)).padStart(2, '0');
  const ss = String(whole % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export interface Timestamp {
  at: number;
  label: string;
}

/** A new list with the timestamp added in time order; a mark at the same second is replaced. */
export function addTimestamp<T extends Timestamp>(list: readonly T[], item: T): T[] {
  return [...list.filter((t) => t.at !== item.at), item].sort((a, b) => a.at - b.at);
}

/** A new array with the item at `from` moved to `to`; unchanged when either is out of range. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const inRange = (i: number) => i >= 0 && i < list.length;
  if (!inRange(from) || !inRange(to)) return [...list];
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
