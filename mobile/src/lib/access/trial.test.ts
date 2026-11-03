import { accessOn, addDays, bestAccess, canOpen, dayLabel, lockReason, samplePlan, trialEnd, trialOverride } from './trial';

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

  test('a plan opens Maple content; a marketplace course still has to be bought', () => {
    expect(canOpen(maple, paid)).toBe(true);
    expect(canOpen(course, paid)).toBe(false);
    expect(lockReason(course, paid)).toBe('buy');
    expect(canOpen({ ...course, owned: true }, paid)).toBe(true);
  });

  test('after the trial only free items, and courses already bought, open', () => {
    expect(canOpen(maple, locked)).toBe(false);
    expect(lockReason(maple, locked)).toBe('pay');
    expect(canOpen({ source: 'maple', free: true }, locked)).toBe(true);
    expect(canOpen({ source: 'marketplace', free: true }, locked)).toBe(true);
    expect(canOpen({ ...course, owned: true }, locked)).toBe(true);
    expect(lockReason({ source: 'maple', free: true }, locked)).toBeNull();
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
