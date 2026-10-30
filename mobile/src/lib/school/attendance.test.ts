import { attendanceSummary, initialRegister } from './attendance';
import type { Mark } from './types';

const mark = (student: number, status: Mark['status'], day = '2026-10-29'): Mark =>
  ({
    id: Math.random(),
    institution: 1,
    term: 1,
    term_name: 'Term 3',
    student,
    student_name: `Student ${student}`,
    record_date: day,
    status,
    recorded_by: 2,
    recorder_name: 'Teacher',
    notes: null,
    created_at: `${day}T08:00:00Z`,
  }) as Mark;

describe('attendanceSummary', () => {
  it('counts each kind of mark and the share of days present', () => {
    const s = attendanceSummary([
      mark(1, 'present', '2026-10-26'),
      mark(1, 'present', '2026-10-27'),
      mark(1, 'late', '2026-10-28'),
      mark(1, 'unauthorized_absent', '2026-10-29'),
    ]);
    expect(s).toEqual({ days: 4, present: 2, late: 1, absent: 1, rate: 75 });
  });

  it('has no rate when nothing is recorded', () => {
    expect(attendanceSummary([]).rate).toBeNull();
  });
});

describe('initialRegister', () => {
  it('starts everyone as present unless today already has a mark', () => {
    const roster = [{ student: 1 }, { student: 2 }, { student: 3 }];
    const reg = initialRegister(roster, [mark(2, 'late')]);
    expect(reg).toEqual({ 1: 'present', 2: 'late', 3: 'present' });
  });
});
