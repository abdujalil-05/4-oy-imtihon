import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../lib/api';
import { hadSession, markSignedIn, markSignedOut } from '../lib/session';
import type { Me } from '../lib/types';

export interface AuthValue {
  me: Me | null;
  loading: boolean;
  signIn: (login: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

export const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const probed = useRef(false);

  const loadMe = useCallback(async () => {
    try {
      const data = await api.get<Me>('/auth/me');
      if (data?.id) {
        setMe(data);
        markSignedIn();
      } else {
        setMe(null);
        markSignedOut();
      }
    } catch {
      setMe(null);
      markSignedOut();
    }
  }, []);

  useEffect(() => {
    if (probed.current) return;
    probed.current = true;

    if (!hadSession()) {
      setLoading(false);
      return;
    }

    void loadMe().finally(() => setLoading(false));
  }, [loadMe]);

  const signIn = useCallback(
    async (login: string, password: string) => {
      await api.post('/auth/signin', { login, password });
      markSignedIn();
      await loadMe();
    },
    [loadMe],
  );

  const signOut = useCallback(async () => {
    try {
      await api.post('/auth/signout');
    } finally {
      setMe(null);
      markSignedOut();
    }
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ me, loading, signIn, signOut, refreshMe: loadMe }),
    [me, loading, signIn, signOut, loadMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
