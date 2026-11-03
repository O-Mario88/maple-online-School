import { lessonTimeProblem, normalizeTime, pickTerm, termProblem, weekDays } from './timetable-week';
import type { Slot, Term } from './types';

const slot = (id: number, day: number, start: string, end = '09:00'): Slot => ({
  id,
  institution: 1,
  term: 1,
  assigned_class: 1,
  class_title: 'S2 East',
  day_of_week: day,
  start_time: start,
  end_time: end,
  room: null,
  room_name: '',
  teacher: null,
  teacher_name: '',
  is_draft: false,
});

const term = (id: number, start: string, active = false): Term => ({
  id,
  institution: 1,
  name: `Term ${id}`,
  start_date: start,
  end_date: '2027-12-01',
  is_active: active,
});

describe('weekDays', () => {
  it('always shows Monday to Friday, with each day’s lessons in time order', () => {
    const days = weekDays([slot(1, 0, '10:00', '11:00'), slot(2, 0, '08:00'), slot(3, 2, '09:00', '10:00')]);
    expect(days.map((d) => d.name)).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    expect(days[0].lessons.map((l) => l.id)).toEqual([2, 1]);
    expect(days[1].lessons).toEqual([]);
    expect(days[2].lessons.map((l) => l.id)).toEqual([3]);
  });

  it('adds Saturday or Sunday only when a lesson falls on them', () => {
    expect(weekDays([slot(1, 5, '08:00')]).map((d) => d.name)).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  });
});

describe('normalizeTime', () => {
  it('pads single-digit hours and trims spaces', () => {
    expect(normalizeTime(' 8:05 ')).toBe('08:05');
    expect(normalizeTime('14:30')).toBe('14:30');
  });

  it('returns null for anything that is not a clock time', () => {
    expect(normalizeTime('25:00')).toBeNull();
    expect(normalizeTime('8.30')).toBeNull();
    expect(normalizeTime('')).toBeNull();
  });
});

describe('lessonTimeProblem', () => {
  it('accepts a lesson that ends after it starts', () => {
    expect(lessonTimeProblem('8:00', '9:00')).toBeNull();
  });

  it('explains bad or back-to-front times', () => {
    expect(lessonTimeProblem('8am', '9:00')).toMatch(/like 08:00/);
    expect(lessonTimeProblem('10:00', '09:00')).toMatch(/after it starts/);
    expect(lessonTimeProblem('09:00', '09:00')).toMatch(/after it starts/);
  });
});

describe('pickTerm', () => {
  it('prefers the active term', () => {
    expect(pickTerm([term(1, '2027-01-10'), term(2, '2026-09-01', true)])?.id).toBe(2);
  });

  it('otherwise takes the term that starts last', () => {
    expect(pickTerm([term(1, '2026-01-10'), term(2, '2027-02-01'), term(3, '2026-09-01')])?.id).toBe(2);
  });

  it('returns null when the school has no terms', () => {
    expect(pickTerm([])).toBeNull();
  });
});

describe('termProblem', () => {
  it('accepts a named term with dates in order', () => {
    expect(termProblem('Term 1', '2027-02-01', '2027-05-01')).toBeNull();
  });

  it('explains what is missing or wrong', () => {
    expect(termProblem('  ', '2027-02-01', '2027-05-01')).toMatch(/name/);
    expect(termProblem('Term 1', '1/2/2027', '2027-05-01')).toMatch(/2027-02-01/);
    expect(termProblem('Term 1', '2027-05-01', '2027-02-01')).toMatch(/after it starts/);
  });
});
