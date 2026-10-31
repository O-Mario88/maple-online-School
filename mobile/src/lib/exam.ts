/** Rules for the exam simulator: the countdown clock, each question's navigator state, the auto-marked tally and identifiers per learning domain. */
import { type Identifier, identifierFor } from './cbc';

export type QuestionState = 'answered' | 'current' | 'flagged' | 'unanswered';

export interface AnswerSheet {
  current: number;
  answers: Readonly<Record<number, number>>;
  flagged: readonly number[];
}

export interface Tally {
  correct: number;
  incorrect: number;
  unanswered: number;
  answered: number;
}

const two = (n: number) => String(n).padStart(2, '0');

/** The exam countdown as HH:MM:SS, never below zero. */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${two(Math.floor(s / 3600))}:${two(Math.floor((s % 3600) / 60))}:${two(s % 60)}`;
}

/** A video position as M:SS. */
export function formatPlayback(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${two(s % 60)}`;
}

/** How the navigator draws a question: the open one first, then flags, then answers. */
export function questionState(n: number, sheet: AnswerSheet): QuestionState {
  if (n === sheet.current) return 'current';
  if (sheet.flagged.includes(n)) return 'flagged';
  return sheet.answers[n] == null ? 'unanswered' : 'answered';
}

/** Auto-marks the objective answers against the key. */
export function tally(key: readonly { n: number; answer: number }[], answers: Readonly<Record<number, number>>): Tally {
  const answered = key.filter((q) => answers[q.n] != null);
  const correct = answered.filter((q) => answers[q.n] === q.answer).length;
  return { correct, incorrect: answered.length - correct, unanswered: key.length - answered.length, answered: answered.length };
}

/** An identifier (1–3) for each learning domain, from the share of its answered questions that are right. */
export function domainIdentifiers(
  key: readonly { n: number; answer: number; domain: 'knowledge' | 'skills' }[],
  answers: Readonly<Record<number, number>>,
): Record<'knowledge' | 'skills', Identifier | null> {
  const of = (d: 'knowledge' | 'skills') => {
    const answered = key.filter((q) => q.domain === d && answers[q.n] != null);
    if (answered.length === 0) return null;
    return identifierFor(answered.filter((q) => answers[q.n] === q.answer).length, answered.length);
  };
  return { knowledge: of('knowledge'), skills: of('skills') };
}
