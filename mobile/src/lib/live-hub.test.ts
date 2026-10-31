import { addDays, addMinutes, addMonths, clock12, dayDot, dayParts, monthTitle, monthWeeks, sessionAction, weekOf } from './live-hub';

describe('dates', () => {
  it('moves across month ends', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-11-01', -1)).toBe('2026-10-31');
  });

  it('builds the Monday-first week around a day', () => {
    expect(weekOf('2026-10-21')).toEqual(['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25']);
    expect(weekOf('2026-10-25')[0]).toBe('2026-10-19');
  });

  it('names a day and its month', () => {
    expect(dayParts('2026-10-21')).toEqual({ dow: 'Wed', date: 21, long: 'Wed 21 Oct' });
    expect(monthTitle('2026-10-21')).toBe('October 2026');
  });

  it('lays the month out in Monday-first weeks with blanks', () => {
    const weeks = monthWeeks('2026-10-21');
    expect(weeks[0]).toEqual([null, null, null, '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']);
    expect(weeks.at(-1)?.at(-1)).toBe(null);
    expect(weeks.flat().filter(Boolean)).toHaveLength(31);
  });
});

describe('clock12', () => {
  it('shows a 24-hour time as 12-hour', () => {
    expect(clock12('09:00')).toBe('9:00 AM');
    expect(clock12('14:30')).toBe('2:30 PM');
    expect(clock12('12:00')).toBe('12:00 PM');
    expect(clock12('00:15')).toBe('12:15 AM');
  });
});

describe('sessionAction', () => {
  const now = { day: '2026-10-21', time: '09:20' };
  const at = (day: string, start: string, end: string) => sessionAction({ day, start, end }, now);

  it('lets you join while it is running', () => {
    expect(at('2026-10-21', '09:00', '09:45')).toBe('join');
  });

  it('marks sessions within two hours as soon, later ones as later', () => {
    expect(at('2026-10-21', '11:00', '11:45')).toBe('soon');
    expect(at('2026-10-21', '14:00', '15:00')).toBe('later');
    expect(at('2026-10-22', '09:00', '10:00')).toBe('later');
  });

  it('marks finished sessions as ended', () => {
    expect(at('2026-10-21', '07:00', '08:00')).toBe('ended');
    expect(at('2026-10-20', '16:00', '17:00')).toBe('ended');
  });
});

describe('dayDot', () => {
  it('shows a missed class before anything else', () => {
    expect(dayDot([{ kind: 'school', attended: false }], true)).toBe('missed');
  });

  it('prefers school classes, then bootcamps and tutors', () => {
    expect(dayDot([{ kind: 'bootcamp' }, { kind: 'school' }], false)).toBe('school');
    expect(dayDot([{ kind: 'tutor' }], false)).toBe('bootcamp');
    expect(dayDot([], false)).toBe('none');
  });
});

describe('addMinutes and addMonths', () => {
  it('adds minutes to a time of day', () => {
    expect(addMinutes('09:20', 15)).toBe('09:35');
    expect(addMinutes('09:50', 15)).toBe('10:05');
  });

  it('moves to the first day of another month', () => {
    expect(addMonths('2026-10-21', 1)).toBe('2026-11-01');
    expect(addMonths('2026-01-15', -1)).toBe('2025-12-01');
  });
});
