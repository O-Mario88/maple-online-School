import { parseLessonTime, upcomingLessons } from './lessons';

const lesson = (id: number, scheduled_at: string) => ({ id, scheduled_at });

describe('upcomingLessons', () => {
  it("keeps today's and later lessons, earliest first", () => {
    const now = new Date(2026, 10, 2, 12, 0); // Monday 2 Nov 2026, noon
    const list = [
      lesson(1, new Date(2026, 10, 3, 9, 0).toISOString()),
      lesson(2, new Date(2026, 10, 2, 8, 0).toISOString()), // earlier today still shows
      lesson(3, new Date(2026, 10, 1, 9, 0).toISOString()), // yesterday is gone
    ];
    expect(upcomingLessons(list, now).map((l) => l.id)).toEqual([2, 1]);
  });
});

describe('parseLessonTime', () => {
  it('turns a date and time into a timestamp the API accepts', () => {
    const result = parseLessonTime('2026-11-02', '09:30');
    expect(result.error).toBeNull();
    expect(new Date(result.value as string).getTime()).toBe(new Date(2026, 10, 2, 9, 30).getTime());
  });
  it('explains what is wrong', () => {
    expect(parseLessonTime('2/11/2026', '09:30').error).toMatch(/YYYY-MM-DD/);
    expect(parseLessonTime('2026-11-02', '9.30').error).toMatch(/HH:MM/);
    expect(parseLessonTime('2026-02-30', '09:30').error).toMatch(/date/);
  });
});
