import { accessOn, addDays, bestAccess, canOpen, dayLabel, featureOpen, lockReason, planOverride, samplePlan, trialEnd, trialOverride } from './trial';

describe('the free month', () => {
  test('lasts one calendar month, ending on the last day of a shorter month', () => {
    expect(trialEnd('2026-10-15')).toBe('2026-11-15');
    expect(trialEnd('2026-12-10')).toBe('2027-01-10');
    expect(trialEnd('2026-01-31')).toBe('2026-02-28');
  });

  test('counts the days left, and locks on the day it ends', () => {
    expect(accessOn({ trialStart: '2026-10-15' }, '2026-11-03')).toEqual({ phase: 'trial', trialEnds: '2026-11-15', daysLeft: 12 });
    expect(accessOn({ trialStart: '2026-10-15' }, '2026-11-14').daysLeft).toBe(1);
    expect(accessOn({ trialStart: '2026-10-15' }, '2026-11-15')).toEqual({ phase: 'locked', trialEnds: '2026-11-15', daysLeft: 0 });
  });

  test('a paid plan keeps everything open until it runs out', () => {
    expect(accessOn({ trialStart: '2026-09-01', paidUntil: '2026-12-01' }, '2026-11-20').phase).toBe('paid');
    expect(accessOn({ trialStart: '2026-09-01', paidUntil: '2026-11-01' }, '2026-11-20').phase).toBe('locked');
  });

  test('a learner covered by a paying school gets the better of the two', () => {
    const own = accessOn({ trialStart: '2026-01-01' }, '2026-11-03');
    const school = accessOn({ trialStart: '2026-01-01', paidUntil: '2027-01-01' }, '2026-11-03');
    expect(bestAccess([own, school]).phase).toBe('paid');
    const short = accessOn({ trialStart: '2026-10-07' }, '2026-11-03');
    const long = accessOn({ trialStart: '2026-10-28' }, '2026-11-03');
    expect(bestAccess([short, long]).daysLeft).toBe(long.daysLeft);
  });
});

describe('what can be opened', () => {
  const trial = accessOn({ trialStart: '2026-10-15' }, '2026-11-03');
  const paid = accessOn({ trialStart: '2026-09-01', paidUntil: '2026-12-01' }, '2026-11-03');
  const locked = accessOn({ trialStart: '2026-09-01' }, '2026-11-03');
  const maple = { source: 'maple' } as const;
  const course = { source: 'marketplace' } as const;

  test('the trial opens everything, marketplace included', () => {
    expect(canOpen(maple, trial)).toBe(true);
    expect(canOpen(course, trial)).toBe(true);
  });

  test('a plan opens everything, teachers’ marketplace subjects included: nothing is bought on its own', () => {
    expect(canOpen(maple, paid)).toBe(true);
    expect(canOpen(course, paid)).toBe(true);
    expect(lockReason(course, paid)).toBeNull();
  });

  test('after the trial only the free tier opens; everything else asks for a plan', () => {
    expect(canOpen(maple, locked)).toBe(false);
    expect(lockReason(maple, locked)).toBe('pay');
    expect(lockReason(course, locked)).toBe('pay');
    expect(canOpen({ source: 'maple', free: true }, locked)).toBe(true);
    expect(canOpen({ source: 'marketplace', free: true }, locked)).toBe(true);
    expect(lockReason({ source: 'maple', free: true }, locked)).toBeNull();
  });
});

describe('plan levels: Basic, then Pro, then Premium', () => {
  const on = (tier: 'basic' | 'pro' | 'premium') => accessOn({ trialStart: '2026-09-01', paidUntil: '2026-12-01', tier }, '2026-11-03');
  const trial = accessOn({ trialStart: '2026-10-15' }, '2026-11-03');
  const locked = accessOn({ trialStart: '2026-09-01' }, '2026-11-03');
  const live = { source: 'maple', needs: 'pro' } as const;

  test('a paid plan carries its level; a plan with none is Basic', () => {
    expect(on('pro').tier).toBe('pro');
    expect(accessOn({ trialStart: '2026-09-01', paidUntil: '2026-12-01' }, '2026-11-03').tier).toBe('basic');
  });

  test('a page needing a higher plan asks to upgrade; the plan or a higher one opens it', () => {
    expect(lockReason(live, on('basic'))).toBe('upgrade');
    expect(lockReason(live, on('pro'))).toBeNull();
    expect(lockReason(live, on('premium'))).toBeNull();
    expect(lockReason({ source: 'maple' }, on('basic'))).toBeNull();
  });

  test('the free month opens every level; after it, the page asks for a plan', () => {
    expect(lockReason(live, trial)).toBeNull();
    expect(lockReason(live, locked)).toBe('pay');
  });

  test('features inside a page follow the same levels', () => {
    expect(featureOpen('stepByStep', on('basic'))).toBe(false);
    expect(featureOpen('stepByStep', on('pro'))).toBe(true);
    expect(featureOpen('videoExplainer', on('pro'))).toBe(false);
    expect(featureOpen('videoExplainer', on('premium'))).toBe(true);
    expect(featureOpen('privateTutor', on('pro'))).toBe(false);
    expect(featureOpen('privateTutor', on('premium'))).toBe(true);
    expect(featureOpen('videoExplainer', trial)).toBe(true);
    expect(featureOpen('stepByStep', locked)).toBe(false);
  });

  test('with nothing to check (no plans in this build), features stay open', () => {
    expect(featureOpen('videoExplainer', null)).toBe(true);
  });

  test('?plan= previews a paid level', () => {
    expect(planOverride('?plan=basic')).toBe('basic');
    expect(planOverride('?trial=paid&plan=premium')).toBe('premium');
    expect(planOverride('?plan=gold')).toBeNull();
  });
});

describe('the samples', () => {
  test('?trial= previews a state; anything else keeps the sample as it is', () => {
    expect(trialOverride('?trial=ended')).toBe('ended');
    expect(trialOverride('?as=learner&trial=paid')).toBe('paid');
    expect(trialOverride('?trial=active')).toBe('active');
    expect(trialOverride('?trial=forever')).toBeNull();
    expect(trialOverride('')).toBeNull();
  });

  test('a sample plan starts the days it has used before today', () => {
    expect(addDays('2026-11-03', -18)).toBe('2026-10-16');
    expect(accessOn(samplePlan(18, '2026-11-03', null), '2026-11-03')).toEqual({ phase: 'trial', trialEnds: '2026-11-16', daysLeft: 13 });
  });

  test('previewing ended or paid gives that state today', () => {
    expect(accessOn(samplePlan(18, '2026-11-03', 'ended'), '2026-11-03').phase).toBe('locked');
    expect(accessOn(samplePlan(18, '2026-11-03', 'paid'), '2026-11-03').phase).toBe('paid');
    expect(accessOn(samplePlan(18, '2026-11-03', 'active'), '2026-11-03').daysLeft).toBe(30);
  });
});

test('days read the same in every language setting: "16 Nov 2026"', () => {
  expect(dayLabel('2026-11-16')).toBe('16 Nov 2026');
  expect(dayLabel('2027-01-03')).toBe('3 Jan 2027');
});
