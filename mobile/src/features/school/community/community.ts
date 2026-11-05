/**
 * Rules for School Community, the school's own moderated space: who can post where and whether
 * it needs moderation, safeguarding limits on messaging learners, and the feed. It is separate
 * from School Network comments, which are public and moderated by Maple.
 */

export interface Member {
  id: string;
  role: 'admin' | 'teacher' | 'learner' | 'parent';
  /** Under 18. */
  minor: boolean;
  /** For parents: their own children. */
  childIds?: readonly string[];
}

export type Place = { kind: 'feed' } | { kind: 'group'; moderated: boolean };
export type Channel = 'direct' | 'class-thread' | 'group-thread' | 'guardian-channel';
export const CATEGORIES = ['All Posts', 'School Updates', 'Academic', 'Events', 'Achievements'] as const;
export type Category = Exclude<(typeof CATEGORIES)[number], 'All Posts'>;

export interface Post {
  id: string;
  authorId: string;
  category: Category;
  at: string;
  likes: number;
  likedBy: readonly string[];
  status: 'published' | 'pending' | 'removed';
}

const STAFF: readonly Member['role'][] = ['admin', 'teacher'];

/** Staff posts go live; a learner's post waits for a moderator school-wide and in moderated groups. */
export function postStatus(author: Member, place: Place): Post['status'] {
  if (STAFF.includes(author.role)) return 'published';
  if (place.kind === 'group' && !place.moderated) return 'published';
  return 'pending';
}

/** Learners are reached only in class or group threads (or by their own guardian); nobody direct-messages a minor. */
export function canMessage(from: Member, to: Member, channel: Channel): boolean {
  if (!to.minor) return true;
  if (channel === 'class-thread' || channel === 'group-thread') return from.role !== 'parent';
  if (channel === 'guardian-channel') return from.role === 'parent' && (from.childIds ?? []).includes(to.id);
  return false;
}

/** Published posts in a category (or all), newest first or most liked first. */
export function filterFeed<T extends Post>(posts: readonly T[], category: (typeof CATEGORIES)[number], sort: 'latest' | 'top'): readonly T[] {
  return posts
    .filter((p) => p.status === 'published' && (category === 'All Posts' || p.category === category))
    .sort((a, b) => (sort === 'top' ? b.likes - a.likes : b.at.localeCompare(a.at)));
}

/** Likes or unlikes a post for one member, returning a new post. */
export function toggleLike<T extends Post>(p: T, memberId: string): T {
  const on = p.likedBy.includes(memberId);
  return { ...p, likes: p.likes + (on ? -1 : 1), likedBy: on ? p.likedBy.filter((id) => id !== memberId) : [...p.likedBy, memberId] };
}
