/**
 * Rules behind Maple Command › Finance › Financial Forecasting & Treasury Planning. Profit is
 * revenue less expenses as earned; cash moves on a different clock (customers pay late, loans and
 * capex leave the bank without being expenses). Runway is cash divided by what Maple spends in a
 * month, so projected revenue growth never makes it look longer.
 */

export type LineKind = 'revenue' | 'variable' | 'fixed';

export interface Line {
  name: string;
  /** Variable costs (teacher payouts, cloud and AI usage) follow revenue; fixed costs do not. */
  kind: LineKind;
  values: readonly number[];
}

export interface Scenario {
  name: string;
  note: string;
  revenue: number;
  /** Multiplier on fixed costs (salaries, marketing, admin); 1 when left out. */
  fixed?: number;
}

export const SCENARIOS = {
  base: { name: 'Base Case', note: 'Expected growth', revenue: 1 },
  high: { name: 'High Growth', note: '+20% revenue', revenue: 1.2 },
  low: { name: 'Low Growth', note: '−10% revenue', revenue: 0.9 },
} as const satisfies Readonly<Record<string, Scenario>>;

export function applyScenario(lines: readonly Line[], s: Scenario): readonly Line[] {
  const factor = (l: Line) => (l.kind === 'fixed' ? (s.fixed ?? 1) : s.revenue);
  return lines.map((l) => (factor(l) === 1 ? l : { ...l, values: l.values.map((v) => Math.round(v * factor(l) * 100) / 100) }));
}

const add = (a: readonly number[], b: readonly number[]) => a.map((v, i) => v + (b[i] ?? 0));
const sum = (a: readonly number[]) => a.reduce((s, v) => s + v, 0);

export function totals(lines: readonly Line[]) {
  const months = lines[0]?.values.length ?? 0;
  const zero = Array.from({ length: months }, () => 0);
  const revenue = lines.filter((l) => l.kind === 'revenue').reduce((acc, l) => add(acc, l.values), zero);
  const expenses = lines.filter((l) => l.kind !== 'revenue').reduce((acc, l) => add(acc, l.values), zero);
  const surplus = revenue.map((v, i) => v - expenses[i]);
  return { revenue: sum(revenue), expenses: sum(expenses), surplus: sum(surplus), monthly: { revenue, expenses, surplus } };
}

export interface CashInputs {
  opening: number;
  /** Share of a month's revenue collected that month; the rest arrives the month after. */
  collectedInMonth: number;
  /** Last actual month's revenue, part of which is collected in the first forecast month. */
  lastRevenue: number;
  capex: readonly number[];
  /** Loan repayments and other financing outflows. */
  financing: readonly number[];
}

export function cashFlow(m: { revenue: readonly number[]; expenses: readonly number[] }, c: CashInputs) {
  const late = 1 - c.collectedInMonth;
  const inflow = m.revenue.map((r, i) => Math.round(r * c.collectedInMonth + (i ? m.revenue[i - 1] : c.lastRevenue) * late));
  const outflow = m.expenses.map((e, i) => e + (c.capex[i] ?? 0) + (c.financing[i] ?? 0));
  const closing = inflow.reduce<number[]>((acc, v, i) => [...acc, (acc[i - 1] ?? c.opening) + v - outflow[i]], []);
  return { inflow, outflow, closing };
}

/** Months the cash would last at the average monthly outflow. */
export function runway(cash: number, outflows: readonly number[]): number {
  if (!outflows.length) return 0;
  const burn = sum(outflows) / outflows.length;
  return burn > 0 ? cash / burn : 0;
}

export const liquidityRatio = (currentAssets: number, currentLiabilities: number): number => (currentLiabilities ? currentAssets / currentLiabilities : 0);
