import { attendanceLine, counts, levelBadge } from './insights';

describe('levelBadge', () => {
  it.each([
    ['high', 'Needs you now', 'danger'],
    ['medium', 'Keep an eye', 'warning'],
    ['ok', 'On track', 'good'],
  ] as const)('%s reads as "%s"', (level, label, tone) => {
    expect(levelBadge(level)).toEqual({ label, tone });
  });
});

describe('counts', () => {
  it('counts learners at each level', () => {
    expect(counts([{ level: 'high' }, { level: 'ok' }, { level: 'high' }, { level: 'medium' }])).toEqual({ high: 2, medium: 1, ok: 1 });
  });
});

describe('attendanceLine', () => {
  it('says how many days were attended, or that none are marked', () => {
    expect(attendanceLine({ days_attended: 17, days_marked: 20 })).toBe('17 of 20 days');
    expect(attendanceLine({ days_attended: 0, days_marked: 0 })).toBe('No days marked');
  });
});
