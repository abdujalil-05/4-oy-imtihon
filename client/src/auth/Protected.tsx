import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './useAuth';
import type { Role } from '../lib/types';
import { Splash } from '../components/layout/Splash';

export function Protected({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { me, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Splash />;
  if (!me) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(me.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
