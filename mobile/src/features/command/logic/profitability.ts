/**
 * Rules behind Maple Command › Finance › Unit Economics & Profitability. Three profits, never
 * mixed: gross profit (revenue less direct delivery costs: teacher payouts, payment fees, cloud,
 * LiveKit, AI and storage), contribution (gross profit less acquisition spend) and operating
 * profit (contribution less shared overheads). Shared costs are allocated to every dimension by
 * one rule, revenue share, so regions, curricula and plans always add back to the platform.
 */

export interface Totals {
  revenue: number;
  direct: number;
  acquisition: number;
  overhead: number;
  learners: number;
  newLearners: number;
  monthlyChurn: number;
  /** Months the totals cover (YTD). */
  months: number;
}

export interface SegmentWeights {
  name: string;
  /** Relative shares; they need not add to 100. */
  revenue: number;
  direct: number;
  learners: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Largest-remainder split: the parts are whole numbers and always add back to `total`. */
export function allocate(total: number, weights: readonly number[]): readonly number[] {
  const sum = weights.reduce((s, w) => s + w, 0);
  const shares = sum > 0 ? weights.map((w) => (total * w) / sum) : weights.map(() => total / weights.length);
  const floors = shares.map(Math.floor);
  let left = Math.round(total - floors.reduce((s, v) => s + v, 0));
  const order = shares.map((s, i) => ({ i, r: s - Math.floor(s) })).sort((a, b) => b.r - a.r || a.i - b.i);
  const out = [...floors];
  for (const { i } of order) {
    if (left <= 0) break;
    out[i] += 1;
    left -= 1;
  }
  return out;
}

export function segmentTable(t: Totals, segments: readonly SegmentWeights[]) {
  const revenue = allocate(t.revenue, segments.map((s) => s.revenue));
  const direct = allocate(t.direct, segments.map((s) => s.direct));
  const acquisition = allocate(t.acquisition, revenue);
  const overhead = allocate(t.overhead, revenue);
  const learners = allocate(t.learners, segments.map((s) => s.learners));
  return segments.map((s, i) => {
    const grossProfit = revenue[i] - direct[i];
    const contribution = grossProfit - acquisition[i];
    const operatingProfit = contribution - overhead[i];
    return { name: s.name, revenue: revenue[i], direct: direct[i], grossProfit, grossMargin: revenue[i] ? round1((grossProfit / revenue[i]) * 100) : 0, contribution, operatingProfit, operatingMargin: revenue[i] ? round1((operatingProfit / revenue[i]) * 100) : 0, learners: learners[i] };
  });
}

export function unitEconomics(t: Totals) {
  const arpu = t.revenue / t.learners;
  const directPerLearner = t.direct / t.learners;
  const grossPerLearner = arpu - directPerLearner;
  const monthlyGross = grossPerLearner / t.months;
  const cac = t.acquisition / t.newLearners;
  const ltv = monthlyGross / t.monthlyChurn;
  return {
    arpu: Math.round(arpu),
    directPerLearner: Math.round(directPerLearner),
    grossPerLearner: Math.round(grossPerLearner),
    grossMargin: round1((grossPerLearner / arpu) * 100),
    operatingPerLearner: Math.round((t.revenue - t.direct - t.acquisition - t.overhead) / t.learners),
    cac: round1(cac),
    ltv: Math.round(ltv),
    ltvToCac: round1(ltv / cac),
    paybackMonths: round1(cac / monthlyGross),
  };
}
