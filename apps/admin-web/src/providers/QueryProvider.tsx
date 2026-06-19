import { QueryClientProvider } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

interface QueryProviderProps extends PropsWithChildren {
  client: QueryClient;
}

export function QueryProvider({ children, client }: QueryProviderProps) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
