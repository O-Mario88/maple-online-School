import { type EventFilters, filterEvents, kindCounts, monthGrid, NO_EVENT_FILTERS, shiftMonth, sortEvents } from './events';

const ev = (id: string, date: string, over: Partial<{ kind: string; format: string; area: string | null; levels: string[]; title: string }> = {}) => ({
  id,
  date,
  title: over.title ?? id,
  kind: over.kind ?? 'Open Day',
  format: over.format ?? 'Virtual',
  area: over.area === undefined ? 'health' : over.area,
  levels: over.levels ?? ['S.5', 'S.6'],
});
const EVENTS = [
  ev('a', '2026-11-18', { kind: 'Group Guidance', levels: ['S.3', 'S.4'] }),
  ev('b', '2026-12-05'),
  ev('c', '2027-01-24', { format: 'In person', area: null }),
  ev('d', '2027-02-26', { kind: 'Career Talk', area: 'science' }),
  ev('old', '2026-10-01'),
];
const ids = (xs: readonly { id: string }[]) => xs.map((x) => x.id);
const f = (patch: Partial<EventFilters>): EventFilters => ({ ...NO_EVENT_FILTERS, ...patch });

describe('career events', () => {
  test('only upcoming events show, filtered by kind, format, area and school level', () => {
    expect(ids(filterEvents(EVENTS, NO_EVENT_FILTERS, '2026-11-05'))).toEqual(['a', 'b', 'c', 'd']);
    expect(ids(filterEvents(EVENTS, f({ kind: 'Career Talk' }), '2026-11-05'))).toEqual(['d']);
    expect(ids(filterEvents(EVENTS, f({ format: 'In person' }), '2026-11-05'))).toEqual(['c']);
    expect(ids(filterEvents(EVENTS, f({ area: 'health' }), '2026-11-05'))).toEqual(['a', 'b', 'c']);
    expect(ids(filterEvents(EVENTS, f({ level: 'S.4' }), '2026-11-05'))).toEqual(['a']);
  });

  test('an event open to every area counts in each area', () => {
    expect(ids(filterEvents(EVENTS, f({ area: 'science' }), '2026-11-05'))).toEqual(['c', 'd']);
  });

  test('date windows keep events within the next 30 or 90 days', () => {
    expect(ids(filterEvents(EVENTS, f({ dates: 'month' }), '2026-11-05'))).toEqual(['a', 'b']);
    expect(ids(filterEvents(EVENTS, f({ dates: 'quarter' }), '2026-11-05'))).toEqual(['a', 'b', 'c']);
  });

  test('tab counts follow the other filters but not the kind', () => {
    expect(kindCounts(EVENTS, f({ kind: 'Career Talk', format: 'Virtual' }), '2026-11-05')).toEqual({ all: 3, 'Open Day': 1, 'Career Talk': 1, 'Career Fair': 0, 'Group Guidance': 1 });
  });

  test('upcoming soon sorts by date; A–Z by title', () => {
    expect(ids(sortEvents(EVENTS.slice(0, 4), 'soonest'))).toEqual(['a', 'b', 'c', 'd']);
    expect(ids(sortEvents([ev('z', '2026-11-20', { title: 'Zebra' }), ev('y', '2026-12-20', { title: 'Apple' })], 'az'))).toEqual(['y', 'z']);
  });

  test('the month calendar starts on Monday and pads with the days around it', () => {
    const weeks = monthGrid(2026, 11);
    expect(weeks[0].map((d) => d.day)).toEqual([26, 27, 28, 29, 30, 31, 1]);
    expect(weeks[0][6]).toEqual({ iso: '2026-11-01', day: 1, inMonth: true });
    expect(weeks[0][0].inMonth).toBe(false);
    expect(weeks[weeks.length - 1].map((d) => d.iso)).toContain('2026-11-30');
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(monthGrid(2026, 11).flat().find((d) => d.iso === '2026-11-18')).toBeDefined();
  });

  test('months step across years', () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth(2027, 1, -1)).toEqual({ year: 2026, month: 12 });
  });
});
