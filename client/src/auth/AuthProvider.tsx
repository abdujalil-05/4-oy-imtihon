import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../lib/api';
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

  const loadMe = useCallback(async () => {
    try {
      const data = await api.get<Me>('/auth/me');
      setMe(data?.id ? data : null);
    } catch {
      setMe(null);
    }
  }, []);

  useEffect(() => {
    void loadMe().finally(() => setLoading(false));
  }, [loadMe]);

  const signIn = useCallback(
    async (login: string, password: string) => {
      await api.post('/auth/signin', { login, password });
      await loadMe();
    },
    [loadMe],
  );

  const signOut = useCallback(async () => {
    try {
      await api.post('/auth/signout');
    } finally {
      setMe(null);
    }
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ me, loading, signIn, signOut, refreshMe: loadMe }),
    [me, loading, signIn, signOut, loadMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
