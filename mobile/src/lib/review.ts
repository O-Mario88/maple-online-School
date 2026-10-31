/** The check a course review passes before it is added: a star rating, a few words, and the same safety rules as squad chat. */
import { MODERATION_HELP, moderate } from './squad';

export const MIN_REVIEW = 10;

/** Why a review can't be posted yet, or null when it can. */
export function reviewProblem(stars: number, text: string): string | null {
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return 'Choose a star rating.';
  if (text.trim().length < MIN_REVIEW) return `Write at least ${MIN_REVIEW} characters.`;
  const check = moderate(text);
  return check.ok ? null : MODERATION_HELP[check.reason];
}
