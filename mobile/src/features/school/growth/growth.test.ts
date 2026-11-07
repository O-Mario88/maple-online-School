import { change, conversionRate, ctr, MIN_COHORT, reasonShares, stageShares } from './growth';

describe('school growth', () => {
  test('each funnel stage as a share of the one before', () => {
    const stages = [
      { key: 'impressions', count: 28_340 },
      { key: 'visits', count: 12_480 },
      { key: 'admissions', count: 5_320 },
      { key: 'started', count: 2_048 },
      { key: 'submitted', count: 1_240 },
      { key: 'enrolled', count: 1_038 },
    ];
    expect(stageShares(stages).map((s) => s.ofPrevious)).toEqual([null, 44.0, 42.6, 38.5, 60.5, 83.7]);
  });

  test('conversion is confirmed enrolments over unique profile visitors, to one decimal', () => {
    expect(conversionRate(1_038, 12_360)).toBe(8.4);
    expect(conversionRate(0, 0)).toBe(0);
  });

  test('click-through rate is clicks over impressions', () => {
    expect(ctr(4_620, 28_340)).toBe(16.3);
  });

  test('change against the previous period, rounded, with its direction', () => {
    expect(change(12_480, 9_455)).toEqual({ pct: 32, up: true });
    expect(change(80, 100)).toEqual({ pct: 20, up: false });
    expect(change(5, 0)).toBeNull();
  });

  test('reasons under the minimum cohort are merged into “Other” so no small group can be singled out', () => {
    expect(MIN_COHORT).toBe(10);
    const shares = reasonShares([
      { label: 'Location (nearby)', count: 380 },
      { label: 'Academic performance', count: 240 },
      { label: 'Programme interest (STEM)', count: 160 },
      { label: 'Curriculum (A-Level)', count: 120 },
      { label: 'School facilities', count: 94 },
      { label: 'Boarding for girls', count: 4 },
      { label: 'Sign language support', count: 2 },
    ]);
    expect(shares.map((s) => [s.label, s.pct])).toEqual([
      ['Location (nearby)', 38],
      ['Academic performance', 24],
      ['Programme interest (STEM)', 16],
      ['Curriculum (A-Level)', 12],
      ['School facilities', 9],
      ['Other', 1],
    ]);
  });

  test('a breakdown with too few people overall is withheld entirely', () => {
    expect(reasonShares([{ label: 'Location (nearby)', count: 6 }])).toEqual([]);
  });
});
