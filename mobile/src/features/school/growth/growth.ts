/**
 * Rules behind School Growth: the admissions funnel, conversion and click-through rates, change
 * on the previous period, and privacy-safe breakdowns. A school only ever sees totals; any
 * group smaller than the minimum cohort is merged or withheld so no person can be singled out.
 */

/** No breakdown shows a group smaller than this. */
export const MIN_COHORT = 10;

const oneDecimal = (n: number) => Math.round(n * 10) / 10;

/** Each stage with its share (%) of the stage before; the first has none. */
export function stageShares<T extends { count: number }>(stages: readonly T[]): readonly (T & { ofPrevious: number | null })[] {
  return stages.map((s, i) => ({ ...s, ofPrevious: i === 0 || stages[i - 1].count === 0 ? null : oneDecimal((s.count / stages[i - 1].count) * 100) }));
}

/** Confirmed enrolments as a % of unique profile visitors. Applications are never counted as enrolments. */
export const conversionRate = (enrolments: number, uniqueVisitors: number): number => (uniqueVisitors > 0 ? oneDecimal((enrolments / uniqueVisitors) * 100) : 0);

/** Recommendation clicks as a % of impressions. */
export const ctr = (clicks: number, impressions: number): number => (impressions > 0 ? oneDecimal((clicks / impressions) * 100) : 0);

/** The change on the previous period as a whole percent and its direction; none when there was nothing before. */
export function change(now: number, before: number): { pct: number; up: boolean } | null {
  if (before <= 0) return null;
  return { pct: Math.round((Math.abs(now - before) / before) * 100), up: now >= before };
}

/** Shares of a breakdown (e.g. why the school was recommended), with groups under the minimum cohort merged into "Other". */
export function reasonShares(rows: readonly { label: string; count: number }[]): readonly { label: string; count: number; pct: number }[] {
  const total = rows.reduce((n, r) => n + r.count, 0);
  if (total < MIN_COHORT) return [];
  const big = rows.filter((r) => r.count >= MIN_COHORT);
  const other = total - big.reduce((n, r) => n + r.count, 0);
  const merged = other > 0 ? [...big, { label: 'Other', count: other }] : big;
  return merged.map((r) => ({ ...r, pct: Math.round((r.count / total) * 100) }));
}
