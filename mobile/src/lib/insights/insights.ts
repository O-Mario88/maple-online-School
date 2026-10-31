import type { components } from '@/lib/api/schema';

export type LearnerInsight = components['schemas']['LearnerInsight'];
export type Intervention = components['schemas']['Intervention'];
export type Level = LearnerInsight['level'];
export type InterventionKind = Intervention['kind'];

export function levelBadge(level: Level): { label: string; tone: 'danger' | 'warning' | 'good' } {
  switch (level) {
    case 'high':
      return { label: 'Needs you now', tone: 'danger' };
    case 'medium':
      return { label: 'Keep an eye', tone: 'warning' };
    default:
      return { label: 'On track', tone: 'good' };
  }
}

export function counts(learners: readonly { level: Level }[]): Record<Level, number> {
  const out: Record<Level, number> = { high: 0, medium: 0, ok: 0 };
  for (const l of learners) out[l.level] += 1;
  return out;
}

export function attendanceLine(l: { days_attended: number; days_marked: number }): string {
  return l.days_marked === 0 ? 'No days marked' : `${l.days_attended} of ${l.days_marked} days`;
}

export const KIND_LABELS: Readonly<Record<InterventionKind, string>> = {
  parent_message: 'Message the family',
  remedial_work: 'Set catch-up work',
  meeting: 'Log a meeting',
  note: 'Add a note',
};
