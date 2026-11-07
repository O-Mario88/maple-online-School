import { type Announcement, archive, type BroadcastForm, duplicate, filterThreads, publish, reachEstimate, schedule, sendMessage, smsSegments, type Thread, toggleReaction, validateBroadcast } from './comms';

const thread = (over: Partial<Thread> = {}): Thread => ({ id: 't1', name: 'Green Valley Academy', kind: 'School', unread: 3, mentions: 0, archived: false, preview: 'Mary: Please review', time: '10:24 AM', messages: [], ...over });

describe('threads', () => {
  test('sending adds the message, updates the preview and clears unread', () => {
    const r = sendMessage(thread(), 'Thanks @James, looks good', 'Mary N.', '10:40 AM');
    expect(r.error).toBeUndefined();
    expect(r.thread.messages.at(-1)).toMatchObject({ by: 'Mary N.', text: 'Thanks @James, looks good', mentions: ['James'] });
    expect(r.thread.preview).toBe('Mary: Thanks @James, looks good');
    expect(r.thread.unread).toBe(0);
  });

  test('an empty message is not sent', () => {
    expect(sendMessage(thread(), '   ', 'Mary N.', '10:40 AM').error).toMatch(/empty/i);
  });

  test('reacting twice with the same emoji takes the reaction back', () => {
    const msg = { id: 'm1', by: 'James', text: 'Hi', time: '09:00', reactions: { '👍': ['Ann'] }, mentions: [] };
    const once = toggleReaction(msg, '👍', 'Mary N.');
    expect(once.reactions['👍']).toEqual(['Ann', 'Mary N.']);
    expect(toggleReaction(once, '👍', 'Mary N.').reactions['👍']).toEqual(['Ann']);
  });

  test('filters by tab and search', () => {
    const list = [thread(), thread({ id: 't2', name: 'James Ochieng', unread: 0, mentions: 2 }), thread({ id: 't3', name: 'Old', archived: true, unread: 0 })];
    expect(filterThreads(list, 'Unread', '').map((t) => t.id)).toEqual(['t1']);
    expect(filterThreads(list, 'Mentions', '').map((t) => t.id)).toEqual(['t2']);
    expect(filterThreads(list, 'Archived', '').map((t) => t.id)).toEqual(['t3']);
    expect(filterThreads(list, 'All Messages', 'james').map((t) => t.id)).toEqual(['t2']);
  });
});

const ann = (over: Partial<Announcement> = {}): Announcement => ({ id: 'a1', title: 'Term 3 Registration', status: 'Draft', ...over });

describe('announcements', () => {
  test('publishing stamps the publish time', () => {
    expect(publish(ann(), 'Oct 26, 2026, 10:00 AM')).toMatchObject({ status: 'Published', publishedAt: 'Oct 26, 2026, 10:00 AM' });
  });

  test('scheduling needs a time in the future', () => {
    expect(schedule(ann(), '2026-10-25T09:00:00Z', '2026-10-26T09:00:00Z').error).toMatch(/future/i);
    expect(schedule(ann(), '2026-10-28T09:00:00Z', '2026-10-26T09:00:00Z').announcement.status).toBe('Scheduled');
  });

  test('archiving and duplicating', () => {
    expect(archive(ann({ status: 'Published' })).status).toBe('Archived');
    expect(duplicate(ann({ status: 'Published' }), 'a9')).toMatchObject({ id: 'a9', title: 'Term 3 Registration (Copy)', status: 'Draft' });
  });
});

const form = (over: Partial<BroadcastForm> = {}): BroadcastForm => ({ audience: 'All Users', groups: [], schools: [], title: 'Holiday', content: 'Schools close Dec 20.', channels: ['In-App Notification'], when: 'now', ...over });

describe('broadcasts', () => {
  test('a complete broadcast is valid', () => {
    expect(validateBroadcast(form(), '2026-10-26T09:00:00Z')).toEqual([]);
  });

  test('lists what is missing', () => {
    const errors = validateBroadcast(form({ audience: 'Specific Groups', title: '', content: '', channels: [], when: 'later', at: '2026-10-20T09:00:00Z' }), '2026-10-26T09:00:00Z');
    expect(errors).toEqual(['Pick at least one group.', 'Add a title.', 'Write the message.', 'Choose at least one channel.', 'Pick a time in the future.']);
  });

  test('counts SMS segments of 160 characters', () => {
    expect(smsSegments('a'.repeat(160))).toBe(1);
    expect(smsSegments('a'.repeat(161))).toBe(2);
  });

  test('estimates reach from the audience', () => {
    const sizes = { Students: 30000, Parents: 18000, Teachers: 3000, 'School Administrators': 400 };
    expect(reachEstimate(form(), sizes)).toBe(51400);
    expect(reachEstimate(form({ audience: 'Specific Groups', groups: ['Parents', 'Teachers'] }), sizes)).toBe(21000);
  });
});
