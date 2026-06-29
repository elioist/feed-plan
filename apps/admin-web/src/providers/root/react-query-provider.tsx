import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 1000 * 60,
      },
    },
  });
}

interface ReactQueryProviderProps extends PropsWithChildren {
  client: QueryClient;
}

export function ReactQueryProvider({ children, client }: ReactQueryProviderProps) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
