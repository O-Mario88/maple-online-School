import {
  calendarFileName,
  dayTotal,
  focusLabel,
  formatMinutes,
  goalCounts,
  goalStatus,
  scheduleIcs,
  weekRange,
  weeklyBreakdown,
  weeksToGo,
} from './schedule';

const S = [
  { day: 'Mon', start: '15:00', end: '15:45', subject: 'Mathematics', topic: 'Quadratic equations', kind: 'study' as const },
  { day: 'Mon', start: '15:45', end: '16:00', subject: '', topic: 'Break', kind: 'break' as const },
  { day: 'Mon', start: '16:00', end: '16:30', subject: 'Physics', topic: 'Motion and forces', kind: 'study' as const },
  { day: 'Tue', start: '15:00', end: '16:30', subject: 'Mathematics', topic: 'Past paper', kind: 'study' as const },
];

describe('My Plan goals and schedule', () => {
  test('a goal is completed, in progress or not started, and the counts follow', () => {
    expect(goalStatus({ done: true, progress: 1 })).toBe('Completed');
    expect(goalStatus({ done: false, progress: 0.7 })).toBe('In progress');
    expect(goalStatus({ done: false, progress: 0 })).toBe('Not started');
    expect(
      goalCounts([
        { done: true, progress: 1 },
        { done: false, progress: 0.4 },
        { done: false, progress: 0 },
        { done: false, progress: 0 },
      ]),
    ).toEqual({ completed: 1, inProgress: 1, notStarted: 2 });
  });

  test('milestones count the weeks still to go', () => {
    expect(weeksToGo(12, 7)).toBe(5);
    expect(weeksToGo(6, 7)).toBe(0);
  });

  test('a subject’s focus reads from how far along it is', () => {
    expect(focusLabel(0.58)).toBe('Needs Attention');
    expect(focusLabel(0.62)).toBe('Improve Further');
    expect(focusLabel(0.75)).toBe('Keep Building');
  });

  test('a day’s study time leaves out breaks; minutes read as hours and minutes', () => {
    expect(dayTotal(S, 'Mon')).toBe(75);
    expect(dayTotal(S, 'Sun')).toBe(0);
    expect(formatMinutes(75)).toBe('1h 15m');
    expect(formatMinutes(45)).toBe('45m');
    expect(formatMinutes(120)).toBe('2h 00m');
  });

  test('the weekly breakdown totals each subject, biggest first, with its share', () => {
    expect(weeklyBreakdown(S)).toEqual({
      total: 165,
      subjects: [
        { subject: 'Mathematics', minutes: 135, share: 82 },
        { subject: 'Physics', minutes: 30, share: 18 },
      ],
    });
  });

  test('the week runs Monday to Sunday around a date, and steps by whole weeks', () => {
    expect(weekRange('2026-11-11', 0)).toEqual({
      start: '2026-11-09',
      end: '2026-11-15',
      label: 'Mon 9 Nov – Sun 15 Nov',
      days: ['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'],
    });
    expect(weekRange('2026-11-11', 1).start).toBe('2026-11-16');
    expect(weekRange('2026-11-09', 0).start).toBe('2026-11-09');
  });

  test('the schedule exports as a calendar file, one event per study session', () => {
    const ics = scheduleIcs(S, '2026-11-09');
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(3);
    expect(ics).toContain('DTSTART:20261109T150000');
    expect(ics).toContain('SUMMARY:Mathematics: Quadratic equations');
    expect(ics).toContain('DTSTART:20261110T150000');
  });
});

describe('calendar file name', () => {
  test('the exported week is named after the Monday it starts on', () => {
    expect(calendarFileName('2026-11-02')).toBe('maple-study-schedule-2026-11-02.ics');
  });
});
