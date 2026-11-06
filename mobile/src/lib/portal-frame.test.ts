import { activeLabel, layoutFrame, ownFrame, routePath } from './portal-frame';

describe('routePath', () => {
  it('turns a screen name into the path it serves', () => {
    expect(routePath('index')).toBe('/');
    expect(routePath('messages/index')).toBe('/messages');
    expect(routePath('family/attendance')).toBe('/family/attendance');
  });

  it('fills dynamic segments from the params, and keeps the segment when a param is missing', () => {
    expect(routePath('teach/live-host/[sessionId]', { sessionId: '42' })).toBe('/teach/live-host/42');
    expect(routePath('messages/[id]')).toBe('/messages/[id]');
  });
});

describe('ownFrame', () => {
  it('names the frame a designed page draws itself', () => {
    expect(ownFrame('school', '/')).toBe('school');
    expect(ownFrame('learner', '/admin/rosters')).toBe('school');
    expect(ownFrame('school', '/command/overview')).toBe('school');
    expect(ownFrame('parent', '/family/academics')).toBe('parent');
    expect(ownFrame('teacher', '/')).toBe('teacher');
    expect(ownFrame('learner', '/teach/studio')).toBe('teacher');
    expect(ownFrame('learner', '/learn/library')).toBe('learner');
  });

  it('is null for a page that leaves the frame to the layout', () => {
    expect(ownFrame('school', '/messages')).toBeNull();
    expect(ownFrame('parent', '/family/attendance')).toBeNull();
    expect(ownFrame('teacher', '/learn/live')).toBeNull();
    expect(ownFrame('parent', '/learn/library')).toBeNull();
  });
});

describe('layoutFrame', () => {
  it("keeps each portal's frame on its pages that don't draw it", () => {
    expect(layoutFrame('school', '/messages')).toBe('school');
    expect(layoutFrame('school', '/more')).toBe('school');
    expect(layoutFrame('parent', '/family/attendance')).toBe('parent');
    expect(layoutFrame('parent', '/learn/library')).toBe('parent');
    expect(layoutFrame('teacher', '/learn/live')).toBe('teacher');
    expect(layoutFrame('teacher', '/more')).toBe('teacher');
  });

  it('draws nothing around a page that draws its own frame', () => {
    expect(layoutFrame('school', '/admin/finance/fees')).toBeNull();
    expect(layoutFrame('parent', '/messages')).toBeNull();
    expect(layoutFrame('teacher', '/teach/calendar')).toBeNull();
  });

  it('leaves full-screen rooms, the reader and Pricing alone', () => {
    expect(layoutFrame('teacher', '/teach/host')).toBeNull();
    expect(layoutFrame('teacher', '/teach/live-host/42')).toBeNull();
    expect(layoutFrame('parent', '/learn/live-room')).toBeNull();
    expect(layoutFrame('parent', '/learn/library/7')).toBeNull();
    expect(layoutFrame('school', '/plans')).toBeNull();
  });

  it('draws nothing for the learner, whose header and sidebar come from the shell', () => {
    expect(layoutFrame('learner', '/messages')).toBeNull();
  });
});

describe('activeLabel', () => {
  const nav = [
    { label: 'Dashboard', href: '/' },
    { label: 'Fees', href: '/admin/finance/fees' },
    { label: 'Communication', href: '/messages' },
  ];

  it('tints the menu item for this page or one of its sub-pages', () => {
    expect(activeLabel(nav, '/messages')).toBe('Communication');
    expect(activeLabel(nav, '/messages/12')).toBe('Communication');
  });

  it('never tints Home for a sub-page, and is empty off the menu', () => {
    expect(activeLabel(nav, '/more')).toBe('');
  });
});
