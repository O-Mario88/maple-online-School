import { byDay, clock, dayLabel, folderCount, inFolder, isThread, listDate, markSeen, matches, NO_MARKS, toggleStar } from './view';
import type { ThreadSummary } from './queries';

const at = (y: number, mo: number, d: number, h = 9, mi = 0) => new Date(y, mo - 1, d, h, mi).toISOString();

const thread = (over: Partial<ThreadSummary> = {}): ThreadSummary => ({
  id: 1,
  subject: "Mary's weekly progress",
  student: { id: 7, name: 'Mary N.' },
  staff: { id: 3, name: 'Ms. Sarah N.' },
  last_message_at: at(2026, 10, 26, 10, 15),
  last_body: 'Thank you! We are practising 10 minutes of mental maths daily.',
  last_author: 'Ms. Sarah N.',
  ...over,
});

describe('message dates', () => {
  const now = new Date(2026, 9, 26, 18, 0);

  it("shows today's messages by time and older ones by date", () => {
    expect(listDate(at(2026, 10, 26, 9, 24), now)).toBe('9:24 AM');
    expect(listDate(at(2026, 10, 25), now)).toBe('Oct 25');
    expect(listDate(at(2025, 12, 30), now)).toBe('Dec 30, 2025');
  });

  it('prints a clock time and a full day label', () => {
    expect(clock(at(2026, 10, 26, 14, 5))).toBe('2:05 PM');
    expect(dayLabel(at(2026, 10, 26))).toBe('Oct 26, 2026');
  });

  it('groups a conversation by day, keeping the order', () => {
    const m = (id: number, iso: string) => ({ id, author: { id: 1, name: 'A' }, body: 'x', created_at: iso });
    const days = byDay([m(1, at(2026, 10, 25, 9)), m(2, at(2026, 10, 26, 9)), m(3, at(2026, 10, 26, 10))]);
    expect(days.map((d) => [d.label, d.messages.map((x) => x.id)])).toEqual([
      ['Oct 25, 2026', [1]],
      ['Oct 26, 2026', [2, 3]],
    ]);
  });
});

describe('folders', () => {
  const me = 'Mr. Okello';

  it('counts a conversation as unread until it is opened after its last message', () => {
    const t = thread();
    expect(inFolder(t, 'unread', NO_MARKS, me)).toBe(true);
    const seen = markSeen(NO_MARKS, t.id, t.last_message_at);
    expect(inFolder(t, 'unread', seen, me)).toBe(false);
    expect(inFolder({ ...t, last_message_at: at(2026, 10, 27) }, 'unread', seen, me)).toBe(true);
  });

  it('never counts your own last message as unread', () => {
    expect(inFolder(thread({ last_author: me }), 'unread', NO_MARKS, me)).toBe(false);
  });

  it('stars and unstars a conversation without changing the old marks', () => {
    const starred = toggleStar(NO_MARKS, 1);
    expect(inFolder(thread(), 'starred', starred, me)).toBe(true);
    expect(inFolder(thread(), 'starred', toggleStar(starred, 1), me)).toBe(false);
    expect(NO_MARKS.starred).toEqual([]);
  });

  it('keeps every conversation in All, and none in a topic the school has not sorted yet', () => {
    expect(inFolder(thread(), 'all', NO_MARKS, me)).toBe(true);
    expect(inFolder(thread(), 'academic', NO_MARKS, me)).toBe(false);
    expect(inFolder(thread(), 'archived', NO_MARKS, me)).toBe(false);
  });

  it('counts the conversations in a folder', () => {
    const list = [thread({ id: 1 }), thread({ id: 2, last_author: me })];
    expect(folderCount(list, 'all', NO_MARKS, me)).toBe(2);
    expect(folderCount(list, 'unread', NO_MARKS, me)).toBe(1);
  });
});

describe('a reply response', () => {
  it('counts as the updated conversation only when it carries its messages', () => {
    expect(isThread({ id: 1, subject: 'x', messages: [] })).toBe(true);
    // A server that answers a reply with a bare acknowledgement must not replace the conversation.
    expect(isThread({ id: 1, ok: true, status: 'ok' })).toBe(false);
    expect(isThread(null)).toBe(false);
  });
});

describe('search', () => {
  it('finds a conversation by its subject, people or last message, ignoring case', () => {
    expect(matches(thread(), 'weekly')).toBe(true);
    expect(matches(thread(), 'sarah')).toBe(true);
    expect(matches(thread(), 'MENTAL MATHS')).toBe(true);
    expect(matches(thread(), 'chemistry')).toBe(false);
    expect(matches(thread(), '  ')).toBe(true);
  });
});
