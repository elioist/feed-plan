import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { AdminRouteError } from '~/components/core/errors/AdminRouteError';
import { ThemeProvider } from '~/providers';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootRoute,
  errorComponent: AdminRouteError,
});

function RootRoute() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}
