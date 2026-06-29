import { lazy, Suspense, type PropsWithChildren } from 'react';

const enableDevtools = import.meta.env.DEV;

const ReactQueryDevtools = enableDevtools
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((module) => ({
        default: module.ReactQueryDevtools,
      })),
    )
  : null;

const TanStackRouterDevtools = enableDevtools
  ? lazy(() =>
      import('@tanstack/react-router-devtools').then((module) => ({
        default: module.TanStackRouterDevtools,
      })),
    )
  : null;

export function DebugProvider({ children }: PropsWithChildren) {
  if (!enableDevtools) return <>{children}</>;

  return (
    <>
      {children}
      <Suspense fallback={null}>
        {ReactQueryDevtools ? (
          <ReactQueryDevtools
            buttonPosition="bottom-left"
            initialIsOpen={false}
            position="bottom"
          />
        ) : null}
        {TanStackRouterDevtools ? (
          <TanStackRouterDevtools initialIsOpen={false} position="bottom-right" />
        ) : null}
      </Suspense>
    </>
  );
}
