/** Formative work is marked out of 20 and the end-of-term exam out of 80 (NCDC). */
export const FORMATIVE_MAX = 20;
export const SUMMATIVE_MAX = 80;

/** A typed score as a number from 0 to max, or null if it isn't one. */
export function parseMark(text: string, max: number): number | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0 || value > max) return null;
  return value;
}
