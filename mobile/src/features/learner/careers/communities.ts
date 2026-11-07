/** Communities rules: the topic chips and the order. Every community is moderated; mentors are vetted. */
interface Group {
  topic: string;
  members: number;
  activeThisWeek: number;
  created: string;
}

export const filterCommunities = <T extends Group>(list: readonly T[], topic: string): T[] => list.filter((g) => topic === 'all' || g.topic === topic);

export type CommunitySort = 'active' | 'newest' | 'largest';

export function sortCommunities<T extends Group>(list: readonly T[], sort: CommunitySort): T[] {
  const by: Record<CommunitySort, (a: T, b: T) => number> = {
    active: (a, b) => b.activeThisWeek - a.activeThisWeek,
    newest: (a, b) => b.created.localeCompare(a.created),
    largest: (a, b) => b.members - a.members,
  };
  return [...list].sort(by[sort]);
}
