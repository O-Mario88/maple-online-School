import type { components } from '@/lib/api/schema';

/** A learner's request to Maple's career team: an event they'd like, or a community to start. */
export type CareerRequest = components['schemas']['CareerRequest'];
export type CareerRequestKind = CareerRequest['kind'];

/** How each status reads to the learner. */
export function requestStatus(status: CareerRequest['status']): { label: string; tone: 'grey' | 'green' | 'amber' } {
  if (status === 'planned') return { label: 'Planned', tone: 'green' };
  if (status === 'declined') return { label: 'Not planned for now', tone: 'amber' };
  return { label: 'Sent to the career team', tone: 'grey' };
}
