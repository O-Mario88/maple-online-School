import {
  durationHours,
  type CalendarCategory,
  type CalendarSlot,
  filterCalendarEvents,
  findCollision,
  formatHourLabel,
  suggestFreeSlots,
} from './teacher-calendar';

const sampleEvents: CalendarSlot[] = [
  {
    id: 'e1',
    day: 3,
    start: 9,
    duration: 1,
    timeLabel: '9:00–10:00',
    title: 'O-Level Mathematics',
    subtitle: 'Class (School)',
    category: 'school',
  },
  {
    id: 'e2',
    day: 3,
    start: 11,
    duration: 1,
    timeLabel: '11:00–12:00',
    title: 'Teacher Meeting',
    category: 'external',
  },
];

describe('formatHourLabel', () => {
  test('formats morning, noon and afternoon hours', () => {
    expect(formatHourLabel(8)).toBe('8:00 AM');
    expect(formatHourLabel(10.5)).toBe('10:30 AM');
    expect(formatHourLabel(12)).toBe('12:00 PM');
    expect(formatHourLabel(13)).toBe('1:00 PM');
    expect(formatHourLabel(20)).toBe('8:00 PM');
  });
});

describe('filterCalendarEvents', () => {
  const allOn: Record<CalendarCategory, boolean> = {
    school: true,
    tutoring: true,
    instant: true,
    tasks: true,
    content: true,
    external: true,
  };

  test('keeps only events whose category is enabled', () => {
    expect(filterCalendarEvents(sampleEvents, allOn)).toHaveLength(2);
    expect(filterCalendarEvents(sampleEvents, { ...allOn, external: false }).map((e) => e.id)).toEqual(['e1']);
  });
});

describe('findCollision', () => {
  test('detects overlapping events on the same day', () => {
    expect(findCollision(sampleEvents, 3, 9, 1)?.id).toBe('e1');
    expect(findCollision(sampleEvents, 3, 9.5, 1)?.id).toBe('e1');
    expect(findCollision(sampleEvents, 3, 8.5, 1)?.id).toBe('e1');
  });

  test('allows adjacent or different-day slots', () => {
    expect(findCollision(sampleEvents, 3, 10, 1)).toBeNull();
    expect(findCollision(sampleEvents, 2, 9, 1)).toBeNull();
  });
});

describe('suggestFreeSlots', () => {
  test('returns clash-free slots starting on the preferred day', () => {
    const days = ['Mon 26', 'Tue 27', 'Wed 28', 'Thu 29', 'Fri 30', 'Sat 31', 'Sun 1'];
    const slots = suggestFreeSlots(sampleEvents, days, 3, 1, 3);
    expect(slots).toHaveLength(3);
    expect(slots[0]).toEqual({ day: 3, start: 8, label: 'Thu 29 · 8:00 AM' });
    expect(slots[1]).toEqual({ day: 3, start: 10, label: 'Thu 29 · 10:00 AM' });
  });
});


describe('durationHours', () => {
  test('reads hours and minutes from the duration picker labels', () => {
    expect(durationHours('45 mins')).toBe(0.75);
    expect(durationHours('1 hour')).toBe(1);
    expect(durationHours('1.5 hours')).toBe(1.5);
    expect(durationHours('2 hours')).toBe(2);
  });

  test('falls back to one hour for a label it cannot read', () => {
    expect(durationHours('soon')).toBe(1);
  });
});
