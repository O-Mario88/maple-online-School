import { canMessage, filterFeed, type Member, type Post, postStatus, toggleLike } from './community';

const teacher: Member = { id: 't1', role: 'teacher', minor: false };
const admin: Member = { id: 'a1', role: 'admin', minor: false };
const learner: Member = { id: 'l1', role: 'learner', minor: true };
const parent: Member = { id: 'p1', role: 'parent', minor: false, childIds: ['l2'] };

const post = (over: Partial<Post>): Post => ({ id: 'x', authorId: 't1', category: 'Academic', at: '2026-11-05T08:00:00Z', likes: 0, likedBy: [], status: 'published', ...over });

describe('school community', () => {
  test('staff posts go live; learner posts in a moderated group or school-wide wait for moderation', () => {
    expect(postStatus(teacher, { kind: 'feed' })).toBe('published');
    expect(postStatus(admin, { kind: 'feed' })).toBe('published');
    expect(postStatus(learner, { kind: 'feed' })).toBe('pending');
    expect(postStatus(learner, { kind: 'group', moderated: true })).toBe('pending');
    expect(postStatus(learner, { kind: 'group', moderated: false })).toBe('published');
  });

  test('no direct messages from adults to learners outside approved class or group threads', () => {
    expect(canMessage(teacher, learner, 'direct')).toBe(false);
    expect(canMessage(teacher, learner, 'class-thread')).toBe(true);
    expect(canMessage(parent, learner, 'direct')).toBe(false);
    expect(canMessage(parent, { ...learner, id: 'l2' }, 'guardian-channel')).toBe(true);
    expect(canMessage(teacher, admin, 'direct')).toBe(true);
  });

  test('the feed shows only published posts, filtered by category, newest or most liked first', () => {
    const list = [
      post({ id: 'a', category: 'Academic', at: '2026-11-05T08:00:00Z', likes: 56 }),
      post({ id: 'b', category: 'Achievements', at: '2026-11-05T05:00:00Z', likes: 92 }),
      post({ id: 'c', category: 'Academic', at: '2026-11-04T10:00:00Z', likes: 3 }),
      post({ id: 'd', category: 'Academic', status: 'pending' }),
    ];
    expect(filterFeed(list, 'All Posts', 'latest').map((p) => p.id)).toEqual(['a', 'b', 'c']);
    expect(filterFeed(list, 'Academic', 'latest').map((p) => p.id)).toEqual(['a', 'c']);
    expect(filterFeed(list, 'All Posts', 'top').map((p) => p.id)).toEqual(['b', 'a', 'c']);
  });

  test('liking toggles once per member, without changing the original post', () => {
    const p = post({ likes: 56 });
    const liked = toggleLike(p, 'u9');
    expect([liked.likes, liked.likedBy]).toEqual([57, ['u9']]);
    expect(toggleLike(liked, 'u9').likes).toBe(56);
    expect(p.likes).toBe(56);
  });
});
