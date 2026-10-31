import { calendarLink, seatsLeft, timeLeft } from './live-event';

describe('timeLeft', () => {
  it('splits the time until the start into days, hours, minutes and seconds', () => {
    const now = Date.UTC(2026, 10, 5, 4, 0, 0);
    const start = now + ((2 * 24 + 14) * 3600 + 32 * 60 + 18) * 1000;
    expect(timeLeft(start, now)).toEqual({ days: 2, hours: 14, minutes: 32, seconds: 18, started: false });
  });

  it('says the class has started once the start time passes', () => {
    expect(timeLeft(1000, 5000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, started: true });
  });
});

describe('seatsLeft', () => {
  it('reports seats left, the share booked and whether to warn', () => {
    expect(seatsLeft(82, 100)).toEqual({ left: 18, booked: 0.82, low: true, full: false });
    expect(seatsLeft(10, 100)).toEqual({ left: 90, booked: 0.1, low: false, full: false });
    expect(seatsLeft(100, 100)).toEqual({ left: 0, booked: 1, low: true, full: true });
  });
});

describe('calendarLink', () => {
  it('builds a Google Calendar link in UTC with the title and details encoded', () => {
    const url = calendarLink({ title: 'P7 Maths & Revision', start: Date.UTC(2026, 10, 8, 7, 0, 0), minutes: 120, details: 'Live on Maple' });
    expect(url).toBe(
      'https://calendar.google.com/calendar/render?action=TEMPLATE&text=P7%20Maths%20%26%20Revision&dates=20261108T070000Z%2F20261108T090000Z&details=Live%20on%20Maple',
    );
  });
});
