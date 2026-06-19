import { RouterProvider } from '@tanstack/react-router';
import { useMemo } from 'react';
import { getRouter } from '~/routes/router';

export function App() {
  const router = useMemo(() => getRouter(), []);

  return <RouterProvider router={router} />;
}
