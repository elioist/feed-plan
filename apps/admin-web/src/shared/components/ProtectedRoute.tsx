import { Navigate } from '@tanstack/react-router';
import type { PropsWithChildren } from 'react';
import { useAuthStore } from '../../features/auth/store.js';

export function ProtectedRoute({ children }: PropsWithChildren) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: undefined }} />;
  }

  return children;
}
