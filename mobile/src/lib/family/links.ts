import type { components } from '@/lib/api/schema';

export type FamilyLink = components['schemas']['FamilyLink'];
export type LinkStatus = FamilyLink['status'];

/** How a link's status reads to a parent or a school. */
export function linkStatus(status: LinkStatus): { label: string; tone: 'warning' | 'good' | 'danger' } {
  switch (status) {
    case 'approved':
      return { label: 'Confirmed', tone: 'good' };
    case 'declined':
      return { label: 'Declined', tone: 'danger' };
    default:
      return { label: 'Waiting for the school', tone: 'warning' };
  }
}

export function relationshipLabel(relationship: string): string {
  if (!relationship) return 'Guardian';
  return relationship.charAt(0).toUpperCase() + relationship.slice(1);
}
