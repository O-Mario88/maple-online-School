/**
 * The learner's own school applications while the app is open: each school's draft, which step
 * it is on, and whether it has been submitted. The School Network page and the application form
 * both read it. It lives on this device only; nothing reaches a school until submitted.
 */
import { useSyncExternalStore } from 'react';

import type { ApplicationForm, StepKey } from './applicationForm';

export interface Application {
  schoolId: string;
  form: ApplicationForm;
  step: StepKey;
  submitted: boolean;
  /** When it was last changed, to show the latest one first. */
  at: number;
}

let apps: Readonly<Record<string, Application>> = {};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const snapshot = () => apps;

/** Seeds a draft once (sample data), without replacing one the learner has already changed. */
export function seedApplication(schoolId: string, form: ApplicationForm): void {
  if (apps[schoolId]) return;
  apps = { ...apps, [schoolId]: { schoolId, form, step: 'applicant', submitted: false, at: 0 } };
}

export function saveApplication(a: Omit<Application, 'at'>): void {
  apps = { ...apps, [a.schoolId]: { ...a, at: Date.now() } };
  emit();
}

export function useApplications(): Readonly<Record<string, Application>> {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** The application changed most recently, if any. */
export function latestApplication(all: Readonly<Record<string, Application>>): Application | undefined {
  return Object.values(all).sort((a, b) => b.at - a.at)[0];
}
