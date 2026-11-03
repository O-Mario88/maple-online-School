import { advance, isBottomUp, nextAction, type School, stageCounts, MIN_TEACHERS } from './institutions';

const school = (over: Partial<School> = {}): School => ({ id: 's1', name: 'Sunrise Primary School', teachers: 3, plan: '', stage: 'Qualified', ...over });

describe('isBottomUp', () => {
  test('a school with at least three active teachers and no contract yet is a bottom-up opportunity', () => {
    expect(MIN_TEACHERS).toBe(3);
    expect(isBottomUp(school())).toBe(true);
    expect(isBottomUp(school({ teachers: 2, stage: 'Registered' }))).toBe(false);
    expect(isBottomUp(school({ stage: 'Active Tenant', plan: 'Standard' }))).toBe(false);
  });
});

describe('nextAction', () => {
  test('says what to do next at each stage', () => {
    expect(nextAction(school({ teachers: 1, stage: 'Registered' }))).toBe('Needs 2 Teachers');
    expect(nextAction(school({ teachers: 3, stage: 'Registered' }))).toBe('Contact School');
    expect(nextAction(school({ stage: 'In Negotiation' }))).toBe('Send Proposal');
    expect(nextAction(school({ stage: 'Active Tenant', renewal: 'Jan 2027' }))).toBe('Renewal (Jan 2027)');
  });
});

describe('advance', () => {
  test('moves a school one stage along the pipeline', () => {
    expect(advance(school(), { used: 10, quota: 100 }).school.stage).toBe('In Negotiation');
  });

  test('a registered school cannot move on until it has three active teachers', () => {
    expect(advance(school({ teachers: 2, stage: 'Registered' }), { used: 0, quota: 10 }).error).toMatch(/3 active teachers/);
  });

  test('activating a tenant uses quota, and is refused when the quota is full', () => {
    const onboarding = school({ stage: 'Onboarding', plan: 'Standard' });
    const ok = advance(onboarding, { used: 9, quota: 10 });
    expect(ok.school.stage).toBe('Active Tenant');
    expect(ok.quotaUsed).toBe(10);
    expect(advance(onboarding, { used: 10, quota: 10 }).error).toMatch(/quota/i);
  });

  test('an active tenant is the end of the pipeline', () => {
    expect(advance(school({ stage: 'Active Tenant' }), { used: 1, quota: 10 }).error).toMatch(/already/i);
  });
});

describe('stageCounts', () => {
  test('counts each stage and the bottom-up opportunities', () => {
    const c = stageCounts([school(), school({ id: 's2', stage: 'Active Tenant', plan: 'Pro' }), school({ id: 's3', stage: 'Registered', teachers: 1 })]);
    expect(c.all).toBe(3);
    expect(c['Active Tenant']).toBe(1);
    expect(c.bottomUp).toBe(1);
  });
});
