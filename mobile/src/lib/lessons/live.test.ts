import { groupSessions, liveAction, providerFor } from './live';

const start = new Date(2026, 10, 2, 9, 0);
const session = (over: Partial<Parameters<typeof liveAction>[0]> = {}) => ({
  status: 'scheduled' as const,
  scheduled_start: start.toISOString(),
  duration_minutes: 60,
  meeting_link: 'https://meet.google.com/abc-defg-hij',
  replay_url: null,
  ...over,
});
const at = (h: number, m: number) => new Date(2026, 10, 2, h, m);

describe('liveAction', () => {
  it('opens the meeting from 15 minutes before until it ends', () => {
    expect(liveAction(session(), at(8, 30)).kind).toBe('wait');
    expect(liveAction(session(), at(8, 46))).toEqual({ kind: 'join', href: 'https://meet.google.com/abc-defg-hij' });
    expect(liveAction(session(), at(9, 59)).kind).toBe('join');
    expect(liveAction(session(), at(10, 1)).kind).toBe('ended');
  });
  it('offers the replay once there is one', () => {
    expect(liveAction(session({ status: 'completed', replay_url: 'https://vimeo.com/1' }), at(12, 0))).toEqual({
      kind: 'replay',
      href: 'https://vimeo.com/1',
    });
    expect(liveAction(session({ status: 'completed' }), at(12, 0)).kind).toBe('ended');
  });
  it('says when a session was cancelled', () => {
    expect(liveAction(session({ status: 'cancelled' }), at(9, 0)).kind).toBe('cancelled');
  });
});

describe('providerFor', () => {
  it('recognises Google Meet and Zoom links only', () => {
    expect(providerFor('https://meet.google.com/abc-defg-hij')).toBe('google_meet');
    expect(providerFor('https://us02web.zoom.us/j/123')).toBe('zoom');
    expect(providerFor('https://evil.example/meet')).toBeNull();
    expect(providerFor('http://meet.google.com/abc')).toBeNull();
  });
});

describe('groupSessions', () => {
  it('splits sessions into live now, coming up (soonest first) and past', () => {
    const later = new Date(2026, 10, 3, 9, 0).toISOString();
    const soon = new Date(2026, 10, 2, 14, 0).toISOString();
    const sessions = [
      { id: 1, ...session() },
      { id: 2, ...session({ scheduled_start: later }) },
      { id: 3, ...session({ scheduled_start: soon }) },
      { id: 4, ...session({ status: 'completed', replay_url: 'https://vimeo.com/1' }) },
      { id: 5, ...session({ status: 'cancelled', scheduled_start: later }) },
    ];
    const g = groupSessions(sessions, at(9, 10));
    expect(g.live.map((s) => s.id)).toEqual([1]);
    expect(g.upcoming.map((s) => s.id)).toEqual([3, 2]);
    expect(g.past.map((s) => s.id)).toEqual([4]);
  });
});
