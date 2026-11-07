import { useCallback, useMemo } from 'react';

import { useMe } from '@/lib/auth/auth-context';
import { portalsFor } from '@/lib/navigation';

import { canOpen, type Who } from './roles';

/** The signed-in account's portals and school roles, for role checks. */
export function useWho(): Who {
  const me = useMe();
  return useMemo<Who>(() => {
    const person = me.data;
    if (!person) return { portals: ['learner'], schoolRoles: [], institution: false };
    return {
      portals: portalsFor(person),
      schoolRoles: person.memberships.filter((m) => m.status === 'active').map((m) => m.role),
      institution: person.role === 'institution',
    };
  }, [me.data]);
}

/** Whether the account's role may open a page; menus drop what it can't. */
export function useCanOpen(): (path: string) => boolean {
  const who = useWho();
  return useCallback((path: string) => canOpen(path.split('?')[0], who), [who]);
}
