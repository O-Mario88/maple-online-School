/**
 * Career Compass planning rules: which deadlines come next, and booking a career counselor with
 * the sessions included in Premium. Counseling notes stay between the learner and the counselor.
 */

import { PREFERENCE_STATEMENTS } from './profile';

export interface Dated {
  id: string;
  title: string;
  date: string;
  kind: string;
}

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const dayNumber = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return Date.UTC(y, m - 1, d) / DAY_MS;
};

/** Deadlines still ahead, soonest first, with the days left. */
export function upcoming<T extends Dated>(items: readonly T[], today: string, limit = 5): (T & { daysLeft: number })[] {
  return items
    .map((x) => ({ ...x, daysLeft: dayNumber(x.date) - dayNumber(today) }))
    .filter((x) => x.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, limit);
}

export interface Slot {
  id: string;
  counselorId: string;
  /** Local time, "YYYY-MM-DDTHH:mm". */
  at: string;
}

export interface Session extends Slot {
  slotId: string;
  topic: string;
}

export interface Counseling {
  /** Included sessions still to use. */
  credits: number;
  sessions: readonly Session[];
}

/** A session cancelled at least this long before it starts gives its credit back. */
export const FREE_CANCEL_HOURS = 24;

const toMs = (at: string) => {
  const [date, time = '00:00'] = at.split('T');
  const [h, min] = time.split(':').map(Number);
  return dayNumber(date) * DAY_MS + h * HOUR_MS + min * 60_000;
};

export const openSlots = <T extends Slot>(slots: readonly T[], c: Counseling): T[] => slots.filter((s) => !c.sessions.some((x) => x.slotId === s.id));

export function bookSession(c: Counseling, slot: Slot, topic: string): { ok: true; next: Counseling } | { ok: false; reason: 'no-credits' | 'taken' } {
  if (c.sessions.some((x) => x.slotId === slot.id)) return { ok: false, reason: 'taken' };
  if (c.credits <= 0) return { ok: false, reason: 'no-credits' };
  const session: Session = { id: `session-${slot.id}`, slotId: slot.id, counselorId: slot.counselorId, at: slot.at, topic };
  return { ok: true, next: { credits: c.credits - 1, sessions: [...c.sessions, session] } };
}

export function cancelSession(c: Counseling, id: string, now: string): { next: Counseling; refunded: boolean } {
  const session = c.sessions.find((x) => x.id === id);
  if (!session) return { next: c, refunded: false };
  const refunded = toMs(session.at) - toMs(now) >= FREE_CANCEL_HOURS * HOUR_MS;
  return { next: { credits: c.credits + (refunded ? 1 : 0), sessions: c.sessions.filter((x) => x.id !== id) }, refunded };
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "Tue 10 Nov · 4:00 PM" from "2026-11-10T16:00". */
export function slotLabel(at: string): string {
  const [date, time] = at.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  const day = DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${day} ${d} ${MONTHS[m - 1]} · ${h % 12 || 12}:${String(min).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

export interface CompassFacts {
  assessed: boolean;
  /** Career profiles the learner has opened. */
  viewed: number;
  savedCareers: number;
  /** The learner's subjects cover what their roadmap goal asks for. */
  subjectsFit: boolean;
  savedPrograms: number;
  /** An application step on the roadmap is done. */
  applying: boolean;
  /** Steps on the learner's roadmap. */
  roadmapSteps: number;
  sessions: number;
}

/** Careers to open before "Discover careers" counts as done, and for the "explored" milestone. */
export const CAREERS_TO_DISCOVER = 3;
export const CAREERS_TO_EXPLORE = 5;
/** Steps a roadmap needs (with a goal and a saved program) to count as full. */
export const FULL_ROADMAP_STEPS = 3;
const JOURNEY = ['Explore Interests', 'Discover Careers', 'Plan Your Subjects', 'Explore Programs', 'Apply & Enrol'] as const;
export type StageStatus = 'done' | 'current' | 'next' | 'later';

/** The career path's five stages and the four progress milestones, from what the learner has actually done. */
export function compassProgress(f: CompassFacts) {
  const stageDone = [f.assessed, f.viewed >= CAREERS_TO_DISCOVER && f.savedCareers > 0, f.savedCareers > 0 && f.subjectsFit, f.savedPrograms > 0, f.applying];
  const current = stageDone.indexOf(false);
  const statusAt = (i: number): StageStatus => (stageDone[i] ? 'done' : i === current ? 'current' : i === current + 1 ? 'next' : 'later');
  const journey = JOURNEY.map((title, i) => ({ title, status: statusAt(i) }));
  const steps = [
    { label: 'Completed interest assessment', done: f.assessed },
    { label: `Explored ${CAREERS_TO_EXPLORE}+ careers`, done: f.viewed >= CAREERS_TO_EXPLORE },
    { label: 'Build your career path in My Plan', done: f.savedCareers > 0 && f.savedPrograms > 0 && f.roadmapSteps >= FULL_ROADMAP_STEPS },
    { label: 'Book a counselor session', done: f.sessions > 0 },
  ];
  return { journey, steps, percent: Math.round((steps.filter((x) => x.done).length / steps.length) * 100) };
}

export type InterestStep = 'interests' | 'work' | 'skills' | 'preferences' | 'results';
/** Interests to pick before moving on, so suggestions are never built on one answer. */
export const MIN_INTERESTS = 3;

export function canContinue(step: InterestStep, a: { interests: readonly string[]; strengths: readonly string[]; environments: readonly string[] }, prefs: Readonly<Record<string, number>> = {}): boolean {
  if (step === 'interests') return a.interests.length >= MIN_INTERESTS;
  if (step === 'preferences') return PREFERENCE_STATEMENTS.every((s) => prefs[s.id] !== undefined);
  if (step === 'work') return a.environments.length > 0;
  if (step === 'skills') return a.strengths.length > 0;
  return true;
}

/** Counseling sessions last this long; the call room opens a little before. */
export const SESSION_MINUTES = 45;
export const JOIN_EARLY_MINUTES = 10;

/** Whether a session's call room is open yet, and how long until it opens. */
export function joinState(at: string, now: string): { state: 'early' | 'open' | 'ended'; minutesToOpen: number } {
  const minutes = (toMs(at) - toMs(now)) / 60_000;
  if (minutes > JOIN_EARLY_MINUTES) return { state: 'early', minutesToOpen: Math.round(minutes - JOIN_EARLY_MINUTES) };
  if (minutes > -SESSION_MINUTES) return { state: 'open', minutesToOpen: 0 };
  return { state: 'ended', minutesToOpen: 0 };
}

/** Extra sessions bought at once, beyond the ones Premium includes. */
export const MAX_EXTRA_SESSIONS = 3;

export function extraSessionsQuote(qty: number, priceUGX: number): { qty: number; totalUGX: number } {
  const n = Math.min(MAX_EXTRA_SESSIONS, Math.max(1, Math.round(qty)));
  return { qty: n, totalUGX: n * priceUGX };
}

export const addSessions = (c: Counseling, qty: number): Counseling => ({ ...c, credits: c.credits + qty });
