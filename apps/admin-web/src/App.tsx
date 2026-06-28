import { RouterProvider } from '@tanstack/react-router';
import { Spin } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '~/providers';
import { createQueryClient } from '~/providers/query-client';
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

  const router = useMemo(
    () => getRouter({ queryClient, routeMenus }),
    [queryClient, routeMenus],
  );

  if (!ready) {
    return (
      <ThemeProvider>
        <div className="admin-boot-screen">
          <Spin size="large" />
        </div>
      </ThemeProvider>
    );
  }

  return <RouterProvider router={router} />;
}
