/**
 * What the learner has saved in Career Compass (careers and programs) and their agreed career
 * actions, while the app is open. Private to the learner: no university sees who saved a program.
 */
import { useSyncExternalStore } from 'react';

import type { Counseling } from './compass';

export interface CareerAction {
  id: string;
  text: string;
  due: string;
  done: boolean;
}

interface Saves {
  careers: readonly string[];
  programs: readonly string[];
  institutions: readonly string[];
  actions: readonly CareerAction[];
  /** Event id to the learner's status: registered, or just interested. */
  events: Readonly<Record<string, EventStatus>>;
  scholarships: readonly string[];
  /** Scholarships the learner is planning an application for. */
  scholarshipPlans: readonly string[];
  communities: readonly string[];
}

export type EventStatus = 'registered' | 'interested';
type Extras = 'institutions' | 'events' | 'scholarships' | 'scholarshipPlans' | 'communities';

let state: Saves | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

const EMPTY: Saves = { careers: [], programs: [], institutions: [], actions: [], events: {}, scholarships: [], scholarshipPlans: [], communities: [] };
const snapshot = () => state ?? EMPTY;

/** Seeds the sample saves once, without replacing anything the learner has changed. */
export function seedSaves(s: Omit<Saves, Extras> & Partial<Pick<Saves, Extras>>): void {
  if (!state) state = { ...EMPTY, ...s };
}

const toggle = (list: readonly string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
const set = (next: Saves) => {
  state = next;
  emit();
};

export const toggleCareer = (id: string) => set({ ...snapshot(), careers: toggle(snapshot().careers, id) });
export const toggleProgram = (id: string) => set({ ...snapshot(), programs: toggle(snapshot().programs, id) });
export const toggleInstitution = (id: string) => set({ ...snapshot(), institutions: toggle(snapshot().institutions, id) });
export const toggleScholarship = (id: string) => set({ ...snapshot(), scholarships: toggle(snapshot().scholarships, id) });
export const toggleScholarshipPlan = (id: string) => set({ ...snapshot(), scholarshipPlans: toggle(snapshot().scholarshipPlans, id) });
export const toggleCommunity = (id: string) => set({ ...snapshot(), communities: toggle(snapshot().communities, id) });
/** Sets or clears (null) the learner's status for an event. */
export function setEventStatus(id: string, status: EventStatus | null): void {
  const { [id]: _old, ...rest } = snapshot().events;
  set({ ...snapshot(), events: status ? { ...rest, [id]: status } : rest });
}
export const toggleAction = (id: string) => set({ ...snapshot(), actions: snapshot().actions.map((a) => (a.id === id ? { ...a, done: !a.done } : a)) });
export const addAction = (a: CareerAction) => set({ ...snapshot(), actions: [...snapshot().actions, a] });

export function useCareerSaves(): Saves {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** The learner's counselor bookings and remaining included sessions. Notes from a session are never shared with institutions. */
let counseling: Counseling | null = null;
const NO_COUNSELING: Counseling = { credits: 0, sessions: [] };
const counselingSnapshot = () => counseling ?? NO_COUNSELING;

export function seedCounseling(c: Counseling): void {
  if (!counseling) counseling = c;
}

export function setCounseling(next: Counseling): void {
  counseling = next;
  emit();
}

export function useCounseling(): Counseling {
  return useSyncExternalStore(subscribe, counselingSnapshot, counselingSnapshot);
}
