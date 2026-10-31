import { mondayFirstDay } from './timetable';

describe('mondayFirstDay', () => {
  it('numbers Monday 0 through Sunday 6, like the timetable API', () => {
    expect(mondayFirstDay(new Date(2026, 10, 2))).toBe(0); // Monday 2 Nov 2026
    expect(mondayFirstDay(new Date(2026, 10, 6))).toBe(4); // Friday
    expect(mondayFirstDay(new Date(2026, 10, 8))).toBe(6); // Sunday
  });
});
