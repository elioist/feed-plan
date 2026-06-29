import type { QueryClient } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { DebugProvider } from './debug-provider';
import { ReactQueryProvider } from './react-query-provider';
import { ThemeProvider } from './theme-provider';

interface AdminAppProvidersProps extends PropsWithChildren {
  queryClient: QueryClient;
}

export function AdminAppProviders({ children, queryClient }: AdminAppProvidersProps) {
  return (
    <ReactQueryProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </ReactQueryProvider>
  );
}

export function RouterInnerProviders({ children }: PropsWithChildren) {
  return <DebugProvider>{children}</DebugProvider>;
}

export { DebugProvider } from './debug-provider';
export { createQueryClient, ReactQueryProvider } from './react-query-provider';
export { ThemeProvider } from './theme-provider';
