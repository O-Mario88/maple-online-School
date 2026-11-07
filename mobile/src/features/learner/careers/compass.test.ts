import { addSessions, bookSession, canContinue, extraSessionsQuote, joinState, MAX_EXTRA_SESSIONS, cancelSession, compassProgress, type Counseling, openSlots, slotLabel, upcoming } from './compass';

const slot = (id: string, at: string) => ({ id, counselorId: 'c1', at });

describe('career compass planning', () => {
  test('upcoming deadlines are soonest first, with days left, and past ones drop off', () => {
    const items = [
      { id: 'a', title: 'Scholarship', date: '2027-01-31', kind: 'Scholarship' },
      { id: 'b', title: 'Open day', date: '2026-11-03', kind: 'Event' },
      { id: 'c', title: 'Nursing diploma', date: '2026-11-20', kind: 'Application' },
    ];
    expect(upcoming(items, '2026-11-05').map((x) => [x.id, x.daysLeft])).toEqual([
      ['c', 15],
      ['a', 87],
    ]);
    expect(upcoming(items, '2026-11-05', 1).map((x) => x.id)).toEqual(['c']);
  });

  test('booking a counselor session uses one included credit and takes the slot', () => {
    const start: Counseling = { credits: 2, sessions: [] };
    const r = bookSession(start, slot('s1', '2026-11-12T16:00'), 'Choosing A-Level subjects');
    if (!r.ok) throw new Error(r.reason);
    expect(r.next.credits).toBe(1);
    expect(r.next.sessions).toEqual([{ id: 'session-s1', slotId: 's1', counselorId: 'c1', at: '2026-11-12T16:00', topic: 'Choosing A-Level subjects' }]);
    expect(start.credits).toBe(2);
    expect(openSlots([slot('s1', '2026-11-12T16:00'), slot('s2', '2026-11-13T10:00')], r.next).map((x) => x.id)).toEqual(['s2']);
  });

  test('a session cannot be booked without credits or in a slot already taken', () => {
    expect(bookSession({ credits: 0, sessions: [] }, slot('s1', '2026-11-12T16:00'), 'x')).toEqual({ ok: false, reason: 'no-credits' });
    const taken: Counseling = { credits: 1, sessions: [{ id: 'session-s1', slotId: 's1', counselorId: 'c1', at: '2026-11-12T16:00', topic: 'x' }] };
    expect(bookSession(taken, slot('s1', '2026-11-12T16:00'), 'y')).toEqual({ ok: false, reason: 'taken' });
  });

  test('cancelling a day or more ahead returns the credit; later cancellations do not', () => {
    const booked: Counseling = { credits: 1, sessions: [{ id: 'session-s1', slotId: 's1', counselorId: 'c1', at: '2026-11-12T16:00', topic: 'x' }] };
    const early = cancelSession(booked, 'session-s1', '2026-11-11T15:00');
    expect(early).toEqual({ next: { credits: 2, sessions: [] }, refunded: true });
    const late = cancelSession(booked, 'session-s1', '2026-11-12T09:00');
    expect(late).toEqual({ next: { credits: 1, sessions: [] }, refunded: false });
  });

  test('a session time reads as weekday, date and 12-hour time', () => {
    expect(slotLabel('2026-11-10T16:00')).toBe('Tue 10 Nov · 4:00 PM');
    expect(slotLabel('2026-11-14T11:30')).toBe('Sat 14 Nov · 11:30 AM');
    expect(slotLabel('2026-11-12T00:05')).toBe('Thu 12 Nov · 12:05 AM');
  });

  test('the five-stage roadmap marks finished stages, the first unfinished as in progress, the one after as next', () => {
    const r = compassProgress({ assessed: true, viewed: 3, savedCareers: 1, subjectsFit: false, savedPrograms: 0, applying: false, roadmapSteps: 1, sessions: 0 });
    expect(r.journey.map((j) => j.title)).toEqual(['Explore Interests', 'Discover Careers', 'Plan Your Subjects', 'Explore Programs', 'Apply & Enrol']);
    expect(r.journey.map((j) => j.status)).toEqual(['done', 'done', 'current', 'next', 'later']);
  });

  test('career progress is the share of the four milestones done', () => {
    const r = compassProgress({ assessed: true, viewed: 5, savedCareers: 1, subjectsFit: true, savedPrograms: 0, applying: false, roadmapSteps: 2, sessions: 0 });
    expect(r.steps.map((x) => [x.label, x.done])).toEqual([
      ['Completed interest assessment', true],
      ['Explored 5+ careers', true],
      ['Build your career path in My Plan', false],
      ['Book a counselor session', false],
    ]);
    expect(r.percent).toBe(50);
    const full = compassProgress({ assessed: true, viewed: 6, savedCareers: 2, subjectsFit: true, savedPrograms: 1, applying: true, roadmapSteps: 3, sessions: 1 });
    expect(full.percent).toBe(100);
    expect(full.journey.every((j) => j.status === 'done')).toBe(true);
  });

  test('each interest step asks for enough choices before moving on', () => {
    const a = { interests: ['science', 'technology'], strengths: [], environments: [] };
    expect(canContinue('interests', a)).toBe(false);
    expect(canContinue('interests', { ...a, interests: [...a.interests, 'sport'] })).toBe(true);
    expect(canContinue('work', a)).toBe(false);
    expect(canContinue('skills', { ...a, strengths: ['Biology'] })).toBe(true);
    expect(canContinue('results', a)).toBe(true);
    expect(canContinue('preferences', a, { helping: 2 })).toBe(false);
    expect(canContinue('preferences', a, { 'real-world': 3, 'living-things': 2, creativity: 1, numbers: 0, helping: 2, outdoors: 1 })).toBe(true);
  });

  test('the call room opens 10 minutes before a session and closes when its 45 minutes end', () => {
    expect(joinState('2026-11-10T16:00', '2026-11-10T15:30')).toEqual({ state: 'early', minutesToOpen: 20 });
    expect(joinState('2026-11-10T16:00', '2026-11-10T15:50')).toEqual({ state: 'open', minutesToOpen: 0 });
    expect(joinState('2026-11-10T16:00', '2026-11-10T16:44')).toEqual({ state: 'open', minutesToOpen: 0 });
    expect(joinState('2026-11-10T16:00', '2026-11-10T16:45')).toEqual({ state: 'ended', minutesToOpen: 0 });
    expect(joinState('2026-11-10T16:00', '2026-11-08T16:00').minutesToOpen).toBe(2870);
  });

  test('extra sessions are priced per session, one to three at a time', () => {
    expect(extraSessionsQuote(2, 45_000)).toEqual({ qty: 2, totalUGX: 90_000 });
    expect(extraSessionsQuote(9, 45_000)).toEqual({ qty: MAX_EXTRA_SESSIONS, totalUGX: 135_000 });
    expect(extraSessionsQuote(0, 45_000)).toEqual({ qty: 1, totalUGX: 45_000 });
  });

  test('paid sessions add to the balance', () => {
    const c: Counseling = { credits: 0, sessions: [] };
    expect(addSessions(c, 2)).toEqual({ credits: 2, sessions: [] });
    expect(c.credits).toBe(0);
  });
});
