import { useContext } from 'react';
import { AuthContext } from './AuthProvider';
import type { AuthValue } from './AuthProvider';
import type { Role } from '../lib/types';

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth AuthProvider ichida ishlatilishi kerak');
  return ctx;
}

export function useRole(): Role | null {
  return useAuth().me?.role ?? null;
}

export function useIsAdmin(): boolean {
  return useRole() === 'SUPERADMIN';
}
