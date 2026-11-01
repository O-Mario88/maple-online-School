/** Small helpers behind the teacher home and the AI course studio (kept here so Jest can test them). */
import type { Href } from 'expo-router';

/** Where a teacher link goes: a route, or "analytics" (the first class's learners view, found at tap time). */
export type TeacherDest = Href | 'analytics';

const MINUTE_MS = 60_000;

export interface Countdown {
  minutes: number;
  label: string;
  live: boolean;
}

/** Whole minutes until a class starts (rounded up), as "in 25 minutes", or "live now" once it has started. */
export function countdown(startMs: number, nowMs: number): Countdown {
  const left = startMs - nowMs;
  if (left <= 0) return { minutes: 0, label: 'live now', live: true };
  const minutes = Math.ceil(left / MINUTE_MS);
  return { minutes, label: `in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`, live: false };
}

/** A short axis label for an amount: 150000 → "150K", 1680000 → "1.68M". */
export function compactAmount(amount: number): string {
  if (amount >= 1_000_000) return `${Number((amount / 1_000_000).toFixed(2))}M`;
  if (amount >= 1_000) return `${Number((amount / 1_000).toFixed(1))}K`;
  return String(amount);
}

/** Each value as a share (0–1) of the largest, for bar heights. */
export function scaleBars(values: readonly number[]): number[] {
  const max = Math.max(0, ...values);
  return values.map((v) => (max === 0 ? 0 : v / max));
}

const LINK_HOSTS: Readonly<Record<'youtube' | 'classroom', { hosts: readonly string[]; message: string }>> = {
  youtube: { hosts: ['youtube.com', 'youtu.be'], message: 'Use a YouTube playlist or video link.' },
  classroom: { hosts: ['classroom.google.com'], message: 'Use a Google Classroom link.' },
};

/** Why a pasted course-source link can't be used, or null when it can. */
export function sourceLinkError(kind: 'youtube' | 'classroom', raw: string): string | null {
  const text = raw.trim();
  if (!text) return 'Paste a link first.';
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return 'That doesn’t look like a web link. It should start with https://';
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return 'That doesn’t look like a web link. It should start with https://';
  const host = url.hostname.replace(/^www\.|^m\./, '');
  const rule = LINK_HOSTS[kind];
  return rule.hosts.some((h) => host === h || host.endsWith(`.${h}`)) ? null : rule.message;
}

export type StepStatus = 'done' | 'running' | 'waiting';

/**
 * Where each processing step stands `elapsed` seconds in. `finishAt` holds the second each
 * step finishes; the first unfinished step is the one running.
 */
export function processingSteps(finishAt: readonly number[], elapsed: number): StepStatus[] {
  const running = finishAt.findIndex((at) => elapsed < at);
  return finishAt.map((_, i) => (running === -1 || i < running ? 'done' : i === running ? 'running' : 'waiting'));
}
