/**
 * Study squad rules: the safety check every chat message passes before it is posted
 * (squads are for children, so no contact details, outside links or unkind words),
 * and the leaderboard order.
 */

export const MAX_MESSAGE = 500;
/** Fewer digits than this in a row is maths or a date, not a phone number. */
const PHONE_DIGITS = 9;

export type ModerationReason = 'empty' | 'long' | 'contact' | 'link' | 'unkind';
export type Moderation = { ok: true; text: string } | { ok: false; reason: ModerationReason };

/** What the learner is told when a message is held back. */
export const MODERATION_HELP: Readonly<Record<ModerationReason, string>> = {
  empty: 'Type a message first.',
  long: `Keep messages under ${MAX_MESSAGE} characters.`,
  contact: 'Phone numbers and email addresses are hidden to keep everyone safe.',
  link: 'Share links through Shared Resources so a teacher can check them first.',
  unkind: 'Please keep it kind. Squad chat is moderated.',
};

const EMAIL = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;
const PHONE_RUN = /\+?\d[\d\s().-]{6,}\d/g;
const LINK = /(https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(com|org|net|co|ug|io|me|ly)(\/\S*)?\b/i;
const UNKIND = /\b(stupid|idiot|dumb|loser|ugly|shut up|hate you)\b/i;

/** Checks a chat message before it is posted. */
export function moderate(raw: string): Moderation {
  const text = raw.trim();
  if (text === '') return { ok: false, reason: 'empty' };
  if (text.length > MAX_MESSAGE) return { ok: false, reason: 'long' };
  const phone = (text.match(PHONE_RUN) ?? []).some((run) => run.replace(/\D/g, '').length >= PHONE_DIGITS);
  if (phone || EMAIL.test(text)) return { ok: false, reason: 'contact' };
  if (LINK.test(text)) return { ok: false, reason: 'link' };
  if (UNKIND.test(text)) return { ok: false, reason: 'unkind' };
  return { ok: true, text };
}

export type Period = 'week' | 'month';

/** Members ordered by their score for the period (ties by name), numbered from 1. */
export function rankMembers<T extends { name: string; scores: Readonly<Record<Period, number>> }>(members: readonly T[], period: Period): (T & { rank: number; score: number })[] {
  return [...members]
    .sort((a, b) => b.scores[period] - a.scores[period] || a.name.localeCompare(b.name))
    .map((m, i) => ({ ...m, rank: i + 1, score: m.scores[period] }));
}
