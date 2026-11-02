/**
 * Which portal the person is using right now. Someone who teaches and is also
 * a parent can switch without signing out; the choice lasts for the session.
 */
import { useQueryClient } from '@tanstack/react-query';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { useMe } from '@/lib/auth/auth-context';
import { mockData } from '@/lib/mock';
import { type Portal, PORTALS, portalsFor } from '@/lib/navigation';

interface PortalState {
  portal: Portal;
  portals: readonly Portal[];
  setPortal: (portal: Portal) => void;
}

const PortalContext = createContext<PortalState | null>(null);

// The last choice, kept outside React: switching modes navigates home, and on iOS and Android that
// can rebuild this provider, which would otherwise forget the choice and fall back to the default.
let lastChosen: Portal | null = null;

export function PortalProvider({ children }: { children: ReactNode }) {
  const me = useMe();
  const queryClient = useQueryClient();
  const [chosen, setChosen] = useState<Portal | null>(() => lastChosen);

  const setPortal = useCallback(
    (next: Portal) => {
      lastChosen = next;
      setChosen(next);
      const mock = mockData();
      if (mock) {
        mock.shared.setActiveDemoByPortal(next);
        void queryClient.invalidateQueries({ queryKey: ['me'] });
      }
    },
    [queryClient],
  );

  const value = useMemo<PortalState>(() => {
    const mock = mockData();
    const portals: readonly Portal[] = mock ? PORTALS : me.data ? portalsFor(me.data) : ['learner'];
    const defaultPortal = mock ? mock.shared.getActiveDemoAccount().portal : portals[0];
    // Fall back to the main portal if the choice no longer applies.
    const portal = chosen && portals.includes(chosen) ? chosen : defaultPortal;
    return { portal, portals, setPortal };
  }, [me.data, chosen, setPortal]);
  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal(): PortalState {
  const state = useContext(PortalContext);
  if (!state) throw new Error('usePortal must be used inside PortalProvider');
  return state;
}
