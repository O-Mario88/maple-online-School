import { allocate, segmentTable, type Totals, unitEconomics } from './profitability';

const T: Totals = { revenue: 1_000, direct: 400, acquisition: 50, overhead: 250, learners: 100, newLearners: 20, monthlyChurn: 0.05, months: 10 };

describe('allocation', () => {
  test('splits a total by weights and always adds back to the total', () => {
    expect(allocate(100, [1, 1, 1])).toEqual([34, 33, 33]);
    expect(allocate(1_000, [50, 30, 20])).toEqual([500, 300, 200]);
    expect(allocate(7, [0, 0])).toEqual([4, 3]);
  });
});

describe('segment profitability', () => {
  test('gross profit, contribution and operating profit are kept apart; shared costs follow revenue share', () => {
    const rows = segmentTable(T, [
      { name: 'Uganda', revenue: 60, direct: 50, learners: 60 },
      { name: 'Kenya', revenue: 40, direct: 50, learners: 40 },
    ]);
    expect(rows[0]).toEqual({ name: 'Uganda', revenue: 600, direct: 200, grossProfit: 400, grossMargin: 66.7, contribution: 370, operatingProfit: 220, operatingMargin: 36.7, learners: 60 });
    expect(rows[1]).toMatchObject({ revenue: 400, direct: 200, grossProfit: 200, contribution: 180, operatingProfit: 80, operatingMargin: 20 });
    expect(rows.reduce((s, r) => s + r.operatingProfit, 0)).toBe(T.revenue - T.direct - T.acquisition - T.overhead);
  });
});

describe('unit economics per paying learner', () => {
  test('ARPU, gross profit per learner, CAC, LTV and payback', () => {
    const u = unitEconomics(T);
    expect(u).toEqual({ arpu: 10, directPerLearner: 4, grossPerLearner: 6, grossMargin: 60, operatingPerLearner: 3, cac: 2.5, ltv: 12, ltvToCac: 4.8, paybackMonths: 4.2 });
  });
});
