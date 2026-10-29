import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api, type Me, onSignedOut, session } from '@/lib/api/client';

type AuthStatus = 'restoring' | 'signedOut' | 'signedIn';

interface AuthValue {
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('restoring');

  useEffect(() => {
    let active = true;
    session.restore().then((ok) => {
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
    setStatus('signedIn');
  }, []);

  const signOut = useCallback(async () => {
    await session.signOut();
    queryClient.clear();
    setStatus('signedOut');
  }, [queryClient]);

  const value = useMemo(() => ({ status, signIn, signOut }), [status, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return value;
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
