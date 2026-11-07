import { filterCommunities, sortCommunities } from './communities';
import { filterCounselors, nextTimes, NO_COUNSELOR_FILTERS } from './counselors';
import { filterScholarships, forMe, isOpen, levelCounts, NO_SCHOLARSHIP_FILTERS, sortScholarships } from './scholarships';

const ids = (xs: readonly { id: string }[]) => xs.map((x) => x.id);

describe('scholarships', () => {
  const sch = (id: string, deadline: string, level: string, area: string, type = 'Partial tuition', title = id) => ({ id, deadline, level, area, type, title });
  const LIST = [sch('h', '2027-01-31', 'Undergraduate', 'health', 'Full tuition'), sch('s', '2027-02-15', 'Undergraduate', 'science'), sch('g', '2026-11-20', 'Diploma & Certificate', 'environment', 'Grant'), sch('old', '2026-09-01', 'Postgraduate', 'health')];

  test('filters combine: any chosen level, any chosen area, any chosen funding type', () => {
    expect(ids(filterScholarships(LIST, { ...NO_SCHOLARSHIP_FILTERS, levels: ['Undergraduate'] }, '2026-11-05'))).toEqual(['h', 's']);
    expect(ids(filterScholarships(LIST, { ...NO_SCHOLARSHIP_FILTERS, levels: ['Undergraduate'], areas: ['science', 'environment'] }, '2026-11-05'))).toEqual(['s']);
    expect(ids(filterScholarships(LIST, { ...NO_SCHOLARSHIP_FILTERS, types: ['Grant', 'Full tuition'] }, '2026-11-05'))).toEqual(['h', 'g']);
  });

  test('the deadline filter keeps those closing in the next 3 months, or later', () => {
    expect(ids(filterScholarships(LIST, { ...NO_SCHOLARSHIP_FILTERS, deadline: 'quarter' }, '2026-11-05'))).toEqual(['h', 'g']);
    expect(ids(filterScholarships(LIST, { ...NO_SCHOLARSHIP_FILTERS, deadline: 'later' }, '2026-11-05'))).toEqual(['s']);
  });

  test('a scholarship is open until its deadline', () => {
    expect(isOpen(LIST[2], '2026-11-20')).toBe(true);
    expect(isOpen(LIST[3], '2026-11-05')).toBe(false);
  });

  test('level counts cover open scholarships', () => {
    expect(levelCounts(LIST, '2026-11-05')).toEqual({ Undergraduate: 2, 'Diploma & Certificate': 1 });
  });

  test('"For Me" means linked to a saved program, or in one of my closest areas', () => {
    expect(ids(forMe(LIST, { areas: ['environment'], linked: ['s'] }, '2026-11-05'))).toEqual(['s', 'g']);
  });

  test('deadline order puts the soonest first; A–Z sorts by title', () => {
    expect(ids(sortScholarships(LIST.slice(0, 3), 'deadline'))).toEqual(['g', 'h', 's']);
    expect(ids(sortScholarships(LIST.slice(0, 3), 'az'))).toEqual(['g', 'h', 's']);
  });
});

describe('counselors', () => {
  const C = [
    { id: 'c1', areas: ['health', 'science'], focus: ['Healthcare', 'Scholarships'], languages: ['English', 'Luganda'], rating: 4.9 },
    { id: 'c2', areas: ['engineering'], focus: ['Engineering'], languages: ['English', 'Runyankole'], rating: 4.8 },
  ];
  const SLOTS = [
    { id: 's1', counselorId: 'c1', at: '2026-11-10T16:00' },
    { id: 's2', counselorId: 'c1', at: '2026-11-03T10:00' },
    { id: 's3', counselorId: 'c2', at: '2026-11-25T15:00' },
    { id: 's4', counselorId: 'c1', at: '2026-11-12T10:00' },
  ];
  const booked = { credits: 1, sessions: [{ id: 'session-s1', slotId: 's1', counselorId: 'c1', at: '2026-11-10T16:00', topic: 'x' }] };

  test('next times are open, still ahead, soonest first', () => {
    expect(ids(nextTimes(SLOTS, booked, 'c1', '2026-11-05T09:00'))).toEqual(['s4']);
    expect(ids(nextTimes(SLOTS, { credits: 2, sessions: [] }, 'c1', '2026-11-05T09:00'))).toEqual(['s1', 's4']);
  });

  test('filters match an area, a specialty, a language, and open times within a week', () => {
    const now = '2026-11-05T09:00';
    expect(ids(filterCounselors(C, SLOTS, booked, { ...NO_COUNSELOR_FILTERS, area: 'engineering' }, now))).toEqual(['c2']);
    expect(ids(filterCounselors(C, SLOTS, booked, { ...NO_COUNSELOR_FILTERS, focus: 'Scholarships' }, now))).toEqual(['c1']);
    expect(ids(filterCounselors(C, SLOTS, booked, { ...NO_COUNSELOR_FILTERS, language: 'Runyankole' }, now))).toEqual(['c2']);
    expect(ids(filterCounselors(C, SLOTS, booked, { ...NO_COUNSELOR_FILTERS, availability: 'week' }, now))).toEqual(['c1']);
  });
});

describe('communities', () => {
  const G = [
    { id: 'a', topic: 'Healthcare', members: 1240, activeThisWeek: 300, created: '2025-09-01' },
    { id: 'b', topic: 'Technology', members: 1530, activeThisWeek: 400, created: '2025-08-20' },
    { id: 'c', topic: 'Healthcare', members: 640, activeThisWeek: 120, created: '2026-05-09' },
  ];
  test('a topic narrows the list; all shows every community', () => {
    expect(ids(filterCommunities(G, 'Healthcare'))).toEqual(['a', 'c']);
    expect(ids(filterCommunities(G, 'all'))).toEqual(['a', 'b', 'c']);
  });
  test('sort by most active this week, newest, or largest', () => {
    expect(ids(sortCommunities(G, 'active'))).toEqual(['b', 'a', 'c']);
    expect(ids(sortCommunities(G, 'newest'))).toEqual(['c', 'a', 'b']);
    expect(ids(sortCommunities(G, 'largest'))).toEqual(['b', 'a', 'c']);
  });
});
