/**
 * Which portal the person is using right now. Someone who teaches and is also
 * a parent can switch without signing out; the choice lasts for the session.
 */
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import { useMe } from '@/lib/auth/auth-context';
import { type Portal, portalsFor } from '@/lib/navigation';

interface PortalState {
  portal: Portal;
  portals: readonly Portal[];
  setPortal: (portal: Portal) => void;
}

const PortalContext = createContext<PortalState | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
  const me = useMe();
  const [chosen, setPortal] = useState<Portal | null>(null);
  const value = useMemo<PortalState>(() => {
    const portals: readonly Portal[] = me.data ? portalsFor(me.data) : ['learner'];
    // Fall back to the main portal if the choice no longer applies.
    const portal = chosen && portals.includes(chosen) ? chosen : portals[0];
    return { portal, portals, setPortal };
  }, [me.data, chosen]);
  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal(): PortalState {
  const state = useContext(PortalContext);
  if (!state) throw new Error('usePortal must be used inside PortalProvider');
  return state;
}
