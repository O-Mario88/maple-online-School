import { applyScenario, cashFlow, type Line, liquidityRatio, runway, SCENARIOS, totals } from './forecast';

const REV: readonly Line[] = [
  { name: 'Subscriptions', kind: 'revenue', values: [100, 100, 100] },
  { name: 'Commissions', kind: 'revenue', values: [20, 20, 20] },
];
const EXP: readonly Line[] = [
  { name: 'Teacher Payouts', kind: 'variable', values: [40, 40, 40] },
  { name: 'Salaries', kind: 'fixed', values: [50, 50, 50] },
];

describe('scenarios', () => {
  test('base leaves the plan as is; high and low move revenue and the costs that follow it', () => {
    expect(totals(applyScenario([...REV, ...EXP], SCENARIOS.base))).toEqual({ revenue: 360, expenses: 270, surplus: 90, monthly: { revenue: [120, 120, 120], expenses: [90, 90, 90], surplus: [30, 30, 30] } });
    const high = totals(applyScenario([...REV, ...EXP], SCENARIOS.high));
    expect([high.revenue, high.expenses]).toEqual([432, 294]);
    const low = totals(applyScenario([...REV, ...EXP], SCENARIOS.low));
    expect([low.revenue, low.expenses]).toEqual([324, 258]);
  });

  test('a custom what-if can also move fixed costs', () => {
    const t = totals(applyScenario([...REV, ...EXP], { name: 'Custom', note: '', revenue: 1.1, fixed: 0.9 }));
    expect([t.revenue, t.expenses]).toEqual([396, 267]);
  });
});

describe('cash is not profit', () => {
  test('collections lag revenue; loan repayments and capex leave cash without touching profit', () => {
    const t = totals(applyScenario([...REV, ...EXP], SCENARIOS.base));
    const c = cashFlow(t.monthly, { opening: 500, collectedInMonth: 0.75, lastRevenue: 80, capex: [0, 30, 0], financing: [10, 10, 10] });
    expect(c.inflow).toEqual([110, 120, 120]);
    expect(c.outflow).toEqual([100, 130, 100]);
    expect(c.closing).toEqual([510, 500, 520]);
    expect(t.surplus).toBe(90);
    expect(c.closing[2] - 500).toBe(20);
  });

  test('runway is cash divided by monthly cash consumption, not helped by revenue growth', () => {
    expect(runway(600, [100, 130, 100])).toBeCloseTo(5.45, 2);
    expect(runway(600, [])).toBe(0);
  });

  test('liquidity ratio', () => {
    expect(liquidityRatio(8_932_400_000, 2_460_850_000)).toBeCloseTo(3.63, 2);
  });
});
