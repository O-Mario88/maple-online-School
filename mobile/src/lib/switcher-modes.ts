/**
 * The role switcher's cards for the modes a person really has. With design data each card
 * takes its design (illustrated tile, colour and description); the design's sample person
 * (their name and photo) is left out, since it isn't who is signed in.
 */
import type { IconName } from '@/lib/icons';
import { type Portal, PORTAL_LABELS } from '@/lib/navigation';

export interface Mode {
  key: string;
  portal: Portal;
  title: string;
  tagline: string;
  detail: string;
  short: string;
  icon: IconName;
  tint: string;
  tile?: number;
  photo?: number;
}

const BLUE = '#1463F3';
const PORTAL_ICONS: Readonly<Record<Portal, IconName>> = { learner: 'cap', teacher: 'school', parent: 'people', school: 'grid', command: 'settings' };

export function modesFrom(portals: readonly Portal[], designed: readonly Mode[] | undefined): Mode[] {
  return portals.map((portal) => {
    const card = designed?.find((d) => d.portal === portal);
    return {
      key: portal,
      portal,
      title: `${PORTAL_LABELS[portal]} Mode`,
      tagline: '',
      detail: card?.detail ?? '',
      short: card?.short ?? '',
      icon: card?.icon ?? PORTAL_ICONS[portal],
      tint: card?.tint ?? BLUE,
      tile: card?.tile,
    };
  });
}
