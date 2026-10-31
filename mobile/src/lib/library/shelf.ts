/** Rules for the learner's digital library: catalogue filters and spaced-repetition flashcards. */

export type Rating = 'again' | 'hard' | 'good' | 'easy';

/** When a card comes back after each rating (the reference's schedule). */
export const RATINGS: readonly { key: Rating; label: string; next: string }[] = [
  { key: 'again', label: 'Again', next: '< 1 day' },
  { key: 'hard', label: 'Hard', next: '3 days' },
  { key: 'good', label: 'Good', next: '1 week' },
  { key: 'easy', label: 'Easy', next: '2 weeks' },
];

const WEIGHT: Record<Rating, number> = { again: 0, hard: 0.5, good: 1, easy: 1 };

export interface ShelfFilter {
  subject?: string;
  level?: string;
  query?: string;
  types?: readonly string[];
  languages?: readonly string[];
  publishers?: readonly string[];
}

type Book = { title: string; subject: string; level: string; type: string; language: string; publisher: string };

/** Books matching every filter; an empty tick list means "any". */
export function filterBooks<T extends Book>(books: readonly T[], f: ShelfFilter): T[] {
  const q = f.query?.trim().toLowerCase();
  const any = (list: readonly string[] | undefined, v: string) => !list || list.length === 0 || list.includes(v);
  return books.filter(
    (b) =>
      (!f.subject || b.subject === f.subject) &&
      (!f.level || b.level === f.level) &&
      (!q || `${b.title} ${b.subject}`.toLowerCase().includes(q)) &&
      any(f.types, b.type) &&
      any(f.languages, b.language) &&
      any(f.publishers, b.publisher),
  );
}

/** How well a deck is known, 0–100: Good and Easy count fully, Hard counts half. */
export function deckProgress(ratings: Readonly<Record<number, Rating>>, size: number): number {
  if (size === 0) return 0;
  const known = Object.values(ratings).reduce((s, r) => s + WEIGHT[r], 0);
  return Math.round((known / size) * 100);
}

export function nextCard(index: number, step: number, size: number): number {
  return (((index + step) % size) + size) % size;
}
