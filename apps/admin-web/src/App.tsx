import { RouterProvider } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { AppLoading } from '~/components/core/base/app-loading';
import { AdminAppProviders, createQueryClient } from '~/providers';
import { getRouter } from '~/routes/router';
import { useAuthStore } from '~/store/modules/auth';

export function App() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const routeMenus = useAuthStore((state) => state.routeMenus);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [ready, setReady] = useState(!accessToken);
  const queryClient = useMemo(() => createQueryClient(), []);

  useEffect(() => {
    let cancelled = false;
    if (!accessToken) {
      setReady(true);
      return;
    }

    setReady(false);
    restoreSession()
      .catch(() => {
        clearSession();
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, clearSession, restoreSession]);

  const router = useMemo(() => getRouter({ queryClient, routeMenus }), [queryClient, routeMenus]);

  if (!ready) {
    return (
      <AdminAppProviders queryClient={queryClient}>
        <AppLoading />
      </AdminAppProviders>
    );
  }

  return (
    <AdminAppProviders queryClient={queryClient}>
      <RouterProvider router={router} />
    </AdminAppProviders>
  );
}
