/**
 * Rules behind My Personalized Learning Plan: where each phase of the journey stands, how
 * each subject is going and what to do next, and whether the learner is on track.
 */

export interface PlanPhase {
  title: string;
  /** The first and last week of the phase, inclusive. */
  from: number;
  to: number;
}

export type PhaseStatus = 'done' | 'current' | 'upcoming';

export function phaseStatus(p: PlanPhase, week: number): PhaseStatus {
  if (week > p.to) return 'done';
  return week >= p.from ? 'current' : 'upcoming';
}

export type SubjectLevel = 'Strong' | 'Good' | 'Developing';

const STRONG = 0.85;
const GOOD = 0.65;

/** How a subject is going, from its progress (0 to 1). */
export const levelFor = (progress: number): SubjectLevel => (progress >= STRONG ? 'Strong' : progress >= GOOD ? 'Good' : 'Developing');

/** A strong subject is reviewed; the rest carry on. */
export const subjectAction = (progress: number): 'Review' | 'Continue' => (progress >= STRONG ? 'Review' : 'Continue');

/** The average progress across subjects, as a whole percent. */
export function overallProgress(progress: readonly number[]): number {
  return progress.length ? Math.round((progress.reduce((n, p) => n + p, 0) / progress.length) * 100) : 0;
}

/** On track while overall progress keeps up with the share of weeks gone. */
export const planStatus = (overallPct: number, week: number, weeks: number): 'On track' | 'Behind' => (overallPct >= Math.round((week / weeks) * 100) ? 'On track' : 'Behind');

/** The phases for a plan of another length: each ends at the same share of the plan, starting the week after the last. */
export function scalePhases(phases: readonly PlanPhase[], weeks: number, length: number): readonly PlanPhase[] {
  if (weeks === length) return phases;
  return phases.reduce<PlanPhase[]>((out, p) => {
    const from = out.length ? out[out.length - 1].to + 1 : 1;
    return [...out, { ...p, from, to: Math.max(from, Math.round((p.to * length) / weeks)) }];
  }, []);
}
