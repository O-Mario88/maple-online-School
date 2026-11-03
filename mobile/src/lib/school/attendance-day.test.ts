import { schoolDay, shiftDay } from './attendance-day';
import type { Mark } from './types';

const mark = (student: number, status: Mark['status']): Mark =>
  ({
    id: student,
    institution: 1,
    term: 1,
    term_name: 'Term 3',
    student,
    student_name: `Learner ${student}`,
    record_date: '2026-11-03',
    status,
    recorded_by: 2,
    recorder_name: 'Teacher',
    notes: null,
    created_at: '2026-11-03T08:00:00Z',
  }) as Mark;

describe('shiftDay', () => {
  it('moves a date forwards or backwards across month ends', () => {
    expect(shiftDay('2026-11-03', -1)).toBe('2026-11-02');
    expect(shiftDay('2026-10-31', 1)).toBe('2026-11-01');
    expect(shiftDay('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('schoolDay', () => {
  const classes = [
    { id: 1, title: 'S1 Blue' },
    { id: 2, title: 'S2 Red' },
    { id: 3, title: 'S3 Gold' },
  ];

  it('splits classes into registered and not yet registered, and totals the day', () => {
    const day = schoolDay(
      classes,
      new Map([
        [1, [mark(1, 'present'), mark(2, 'late'), mark(3, 'unauthorized_absent')]],
        [2, []],
        [3, [mark(4, 'authorized_absent')]],
      ]),
    );
    expect(day.registered.map((r) => r.title)).toEqual(['S1 Blue', 'S3 Gold']);
    expect(day.missing.map((c) => c.title)).toEqual(['S2 Red']);
    expect(day.totals).toMatchObject({ present: 1, late: 1, absent: 2, rate: 50 });
  });

  it('lists unexcused absences, which need a call home', () => {
    const day = schoolDay(classes, new Map([[1, [mark(1, 'unauthorized_absent'), mark(2, 'authorized_absent')]]]));
    expect(day.unexcused.map((u) => [u.name, u.classTitle])).toEqual([['Learner 1', 'S1 Blue']]);
  });
});
