import { Maple } from '@/constants/maple';
import { Palette } from '@/constants/palette';

/** Small rules behind the Executive Overview. */

/** Zero-Signup conversion: completed signups over started signups. */
export function conversionRate(started: number, completed: number): string {
  if (started <= 0) return '0.0%';
  return `${((completed / started) * 100).toFixed(1)}%`;
}

export type RetentionLevel = 'strong' | 'good' | 'fair' | 'weak' | 'none';

/** Retention at or above this is strong (deep green). */
const STRONG = 75;
const GOOD = 64;
const FAIR = 55;

const SHADES: Readonly<Record<RetentionLevel, { bg: string; text: string }>> = {
  strong: { bg: Palette.green200b, text: Maple.successText },
  good: { bg: Maple.successSoft, text: Maple.successText },
  fair: { bg: Palette.yellow200, text: Palette.yellow900 },
  weak: { bg: Maple.warningSoft, text: Maple.warningText },
  none: { bg: Maple.blueSoft, text: Maple.muted },
};

/** The heat-table shade for a cohort's retention: green when strong, orange when weak, blank when too young. */
export function retentionShade(value: number | null): { level: RetentionLevel; bg: string; text: string } {
  if (value === null) return { level: 'none', ...SHADES.none };
  const level: RetentionLevel = value >= STRONG ? 'strong' : value >= GOOD ? 'good' : value >= FAIR ? 'fair' : 'weak';
  return { level, ...SHADES[level] };
}

/** The cards on one page of a carousel; past the last page it starts again. */
export function carouselPage<T>(items: readonly T[], page: number, per: number): readonly T[] {
  const pages = Math.max(1, Math.ceil(items.length / per));
  const p = ((page % pages) + pages) % pages;
  return items.slice(p * per, p * per + per);
}

const BILLION = 1_000_000_000;
const MILLION = 1_000_000;
const THOUSAND = 1_000;

/** "UGX 185.6M", "UGX 2.48B", "UGX 950K". */
export function shortUgx(n: number): string {
  if (n >= BILLION) return `UGX ${(n / BILLION).toFixed(2).replace(/\.?0+$/, '')}B`;
  if (n >= MILLION) return `UGX ${(n / MILLION).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= THOUSAND) return `UGX ${Math.round(n / THOUSAND)}K`;
  return `UGX ${n}`;
}
