/** Filtering the public Maple Shorts feed, and the short counts it shows (1.2M, 34K). */

export interface ShortClip {
  id: string;
  title: string;
  topic: string;
  board: string;
  level: string;
  subject: string;
  type: string;
  language: string;
  teacher: string;
}

export interface ShortFilters {
  query: string;
  /** The topic chip; "For You" shows every topic. */
  topic: string;
  boards: readonly string[];
  levels: readonly string[];
  subjects: readonly string[];
  types: readonly string[];
  languages: readonly string[];
}

export const FOR_YOU = 'For You';

export const EMPTY_SHORT_FILTERS: ShortFilters = { query: '', topic: FOR_YOU, boards: [], levels: [], subjects: [], types: [], languages: [] };

function anyOf(selected: readonly string[], value: string): boolean {
  return selected.length === 0 || selected.includes(value);
}

function matchesQuery(c: ShortClip, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = `${c.title} ${c.teacher} ${c.subject}`.toLowerCase();
  return words.every((w) => haystack.includes(w));
}

/** Clips matching the topic chip, the search and every ticked filter group. */
export function filterShorts<T extends ShortClip>(clips: readonly T[], f: ShortFilters): T[] {
  return clips.filter(
    (c) =>
      (f.topic === FOR_YOU || c.topic === f.topic) &&
      matchesQuery(c, f.query) &&
      anyOf(f.boards, c.board) &&
      anyOf(f.levels, c.level) &&
      anyOf(f.subjects, c.subject) &&
      anyOf(f.types, c.type) &&
      anyOf(f.languages, c.language),
  );
}

const UNITS = [
  { at: 1_000_000, suffix: 'M' },
  { at: 1_000, suffix: 'K' },
] as const;

/** 980, 1.2K, 34K, 1.2M: one decimal place only when it adds information. */
export function formatCount(n: number): string {
  const unit = UNITS.find((u) => n >= u.at);
  if (!unit) return String(n);
  const value = n / unit.at;
  const shown = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${shown}${unit.suffix}`;
}
