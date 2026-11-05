import { capacityAlert, changePreview, contractPrice, licensedLearners, type Member, type PlanVersion, recommendedPlan, usagePct } from './plans';

const v = (id: PlanVersion['planId'], version: string, priceUGX: number, learners: number): PlanVersion => ({
  planId: id,
  version,
  name: `Maple ${id[0].toUpperCase()}${id.slice(1)}`,
  priceUGX,
  learners,
  allowances: { liveSessions: learners / 3, storageGB: learners / 2, streamingGB: learners / 3 },
  effective: '2026-11-01',
});
const PLANS = [v('launch', '2026-11', 1_500_000, 300), v('growth', '2026-11', 3_500_000, 700), v('enterprise', '2026-11', 7_500_000, 1500)];

const m = (over: Partial<Member>): Member => ({ id: 'x', personId: 'p', role: 'learner', status: 'active', enrolled: true, ...over });

describe('institution plans', () => {
  test('only active, enrolled learners count, each person once', () => {
    const people = [
      m({ id: 'a', personId: 'aisha' }),
      // The same learner through a second class registration, and an independent account linked to her.
      m({ id: 'a2', personId: 'aisha' }),
      m({ id: 'b', personId: 'brian' }),
      m({ id: 'c', personId: 'carol', status: 'archived' }),
      m({ id: 'd', personId: 'dan', status: 'former' }),
      m({ id: 'e', personId: 'eve', enrolled: false }),
      m({ id: 't', personId: 'tom', role: 'teacher' }),
      m({ id: 'p', personId: 'pam', role: 'parent' }),
      m({ id: 's', personId: 'sam', role: 'admin' }),
    ];
    expect(licensedLearners(people)).toBe(2);
  });

  test('capacity warnings at 80%, 90% and 100%', () => {
    expect(capacityAlert(486, 700)).toBeNull();
    expect(capacityAlert(560, 700)).toBe(80);
    expect(capacityAlert(640, 700)).toBe(90);
    expect(capacityAlert(700, 700)).toBe(100);
    expect(capacityAlert(720, 700)).toBe(100);
  });

  test('usage as a whole percent of the allowance', () => {
    expect(usagePct(486, 700)).toBe(69);
    expect(usagePct(42, 100)).toBe(42);
    expect(usagePct(5, 0)).toBe(100);
  });

  test('the smallest plan that fits the learners, or the largest', () => {
    expect(recommendedPlan(250, PLANS).planId).toBe('launch');
    expect(recommendedPlan(486, PLANS).planId).toBe('growth');
    expect(recommendedPlan(1600, PLANS).planId).toBe('enterprise');
  });

  test('an upgrade charges the price difference for the days left in the term, now', () => {
    const p = changePreview(PLANS[1], PLANS[2], { start: '2026-09-01', end: '2026-12-10', today: '2026-11-05' }, { learners: 486, storageGB: 128 });
    // 35 of 100 days left: (7,500,000 − 3,500,000) × 35 / 100.
    expect(p).toEqual({ kind: 'upgrade', chargeNowUGX: 1_400_000, applies: 'now', issues: [] });
  });

  test('a downgrade starts at renewal, charges nothing now and says what would be over the limit, removing nothing', () => {
    const p = changePreview(PLANS[1], PLANS[0], { start: '2026-09-01', end: '2026-12-10', today: '2026-11-05' }, { learners: 486, storageGB: 200 });
    expect(p.kind).toBe('downgrade');
    expect(p.chargeNowUGX).toBe(0);
    expect(p.applies).toBe('renewal');
    expect(p.issues).toEqual([
      '486 active learners is more than Maple Launch includes (300). No learner is removed; add seats or archive learners who have left before renewal.',
      '200 GB of storage is more than Maple Launch includes (150 GB). Nothing is deleted; new uploads pause until usage is under the allowance.',
    ]);
  });

  test('a school keeps the price of the plan version on its contract when the public price changes', () => {
    const versions = [...PLANS, v('growth', '2027-01', 3_900_000, 700)];
    expect(contractPrice({ planId: 'growth', version: '2026-11' }, versions)).toBe(3_500_000);
    expect(contractPrice({ planId: 'growth', version: '2027-01' }, versions)).toBe(3_900_000);
  });
});
