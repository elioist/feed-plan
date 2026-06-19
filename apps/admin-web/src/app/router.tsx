import { createRouter } from '@tanstack/react-router';
import { QueryProvider } from '~/app/Providers';
import { createQueryClient } from '~/app/query-client';
import { routeTree } from '~/routeTree.gen';

export function getRouter() {
  const queryClient = createQueryClient();

  const router = createRouter({
    routeTree,
    context: {
      queryClient,
    },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultStructuralSharing: true,
    scrollRestoration: true,
    Wrap: ({ children }) => <QueryProvider client={queryClient}>{children}</QueryProvider>,
  });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
