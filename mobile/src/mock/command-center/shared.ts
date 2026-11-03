/**
 * Shared pieces of the Maple Command sample data (Edwin's references, November 2026): the
 * signed-in global administrator, the people photos reused across pages and small helpers.
 * Names, dates and figures are illustrative.
 */
import type { IconName } from '@/lib/icons';

export type Photo = number;
export type Tone = 'blue' | 'red' | 'orange' | 'purple' | 'green' | 'grey';

export const face = {
  mary: require('../images/pp-mary.png') as Photo,
  sarah: require('../images/pp-sarah.png') as Photo,
  esther: require('../images/pp-esther.png') as Photo,
  nakato: require('../images/pp-nakato.png') as Photo,
  john: require('../images/pp-john.png') as Photo,
  okello: require('../images/pp-okello.png') as Photo,
  kato: require('../images/pp-kato.png') as Photo,
  aisha: require('../images/sq-face-aisha.png') as Photo,
  grace: require('../images/sq-face-grace.png') as Photo,
  ruth: require('../images/sq-face-sarah.png') as Photo,
  agnes: require('../images/sq-face-daniel.png') as Photo,
  james: require('../images/sq-face-james.png') as Photo,
  michael: require('../images/sq-face-michael.png') as Photo,
  tutorA: require('../images/livehub-tutor-1.png') as Photo,
  tutorB: require('../images/livehub-tutor-2.png') as Photo,
  tutorC: require('../images/livehub-tutor-3.png') as Photo,
  tutorD: require('../images/livehub-tutor-4.png') as Photo,
};

export const me = { name: 'Mary N.', role: 'Global Administrator', avatar: face.mary, notifications: 12 };

export const ranges = ['Oct 1, 2026 – Oct 31, 2026', 'Sep 1, 2026 – Sep 30, 2026', 'Jul 1, 2026 – Sep 30, 2026'];

export interface KpiData {
  label: string;
  value: string;
  icon: IconName;
  tone: Tone;
  delta?: string;
  down?: boolean;
  good?: boolean;
  caption?: string;
  valueTone?: Tone;
  progress?: number;
}

/** A smooth, repeatable daily series: a trend with a gentle wave, so charts look like the references. */
export function wave(n: number, start: number, end: number, amp: number, phase = 0): readonly number[] {
  return Array.from({ length: n }, (_, i) => {
    const t = n > 1 ? i / (n - 1) : 0;
    return Math.round((start + (end - start) * t + amp * Math.sin(i * 1.3 + phase) + (amp / 2) * Math.sin(i * 0.55 + phase * 2)) * 100) / 100;
  });
}

export const days = (n: number, month = 'Oct'): readonly string[] => Array.from({ length: n }, (_, i) => `${month} ${i + 1}`);
