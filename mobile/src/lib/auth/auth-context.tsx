import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { guestEnabled } from '@/lib/access/guest';
import { api, type Me, onSignedOut, session } from '@/lib/api/client';
import { DESIGN_DATA, mockApi } from '@/lib/mock';

type AuthStatus = 'restoring' | 'signedOut' | 'signedIn';

interface AuthValue {
  status: AuthStatus;
  /** Browsing free without an account: the catalogues and free resources open, everything else asks them to sign up. */
  guest: boolean;
  /** Start browsing free; null where it isn't offered (a deployment build, until the free resources come from the API). */
  browseFree: (() => void) | null;
  /** Signed in during this visit after browsing free: their free month starts today. */
  joinedFromGuest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

/** On the web, browsing free lasts the browser tab's session, so a reload doesn't send the visitor back to the homepage. */
const GUEST_KEY = 'maple.browsingFree';
function rememberGuest(on: boolean) {
  try {
    if (typeof sessionStorage === 'undefined') return;
    if (on) sessionStorage.setItem(GUEST_KEY, '1');
    else sessionStorage.removeItem(GUEST_KEY);
  } catch {
    // Storage can be blocked (a private window); browsing free then lasts until the page reloads.
  }
}
function rememberedGuest(): boolean {
  try {
    return guestEnabled(DESIGN_DATA) && typeof sessionStorage !== 'undefined' && sessionStorage.getItem(GUEST_KEY) === '1';
  } catch {
    return false;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('restoring');
  const [guest, setGuest] = useState(rememberedGuest);
  useEffect(() => rememberGuest(guest), [guest]);
  const [joinedFromGuest, setJoinedFromGuest] = useState(false);

  useEffect(() => {
    let active = true;
    session.restore().then(async (ok) => {
      if (!ok) {
        const mock = mockApi();
        if (mock) {
          await session.signIn(mock.shared.getActiveDemoAccount().email, 'demo1234');
          if (active) setStatus('signedIn');
          return;
        }
      }
      if (active) setStatus(ok ? 'signedIn' : 'signedOut');
    });
    const unsubscribe = onSignedOut(() => {
      queryClient.clear();
      setStatus('signedOut');
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [queryClient]);

  const signIn = useCallback(async (email: string, password: string) => {
    await session.signIn(email.trim(), password);
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    setJoinedFromGuest(guest);
    setGuest(false);
    setStatus('signedIn');
  }, [queryClient, guest]);

  const signOut = useCallback(async () => {
    await session.signOut();
    queryClient.clear();
    setGuest(false);
    setJoinedFromGuest(false);
    setStatus('signedOut');
  }, [queryClient]);

  const browseFree = useMemo(() => (guestEnabled(DESIGN_DATA) ? () => setGuest(true) : null), []);
  const value = useMemo(
    () => ({ status, guest: guest && status === 'signedOut', browseFree, joinedFromGuest, signIn, signOut }),
    [status, guest, browseFree, joinedFromGuest, signIn, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return value;
}

/** Start browsing free and open Explore; null where browsing free isn't offered. */
export function useStartFree(): (() => void) | null {
  const { browseFree } = useAuth();
  return useMemo(
    () =>
      browseFree
        ? () => {
            browseFree();
            // The signed-in pages open to guests once the flag is set, so go there on the next tick.
            setTimeout(() => router.push('/learn/explore'), 0);
          }
        : null,
    [browseFree],
  );
}

/** The signed-in user, loaded from GET /api/v1/auth/me/. */
export function useMe() {
  const { status } = useAuth();
  return useQuery({
    queryKey: ['me'],
    enabled: status === 'signedIn',
    queryFn: async (): Promise<Me> => {
      const { data, error } = await api.GET('/api/v1/auth/me/');
      if (error || !data) {
        throw new Error(error?.detail ?? 'Could not load your account.');
      }
      return data;
    },
  });
}
