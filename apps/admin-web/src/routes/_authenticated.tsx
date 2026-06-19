import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout.js';
import { useAuthStore } from '../features/auth/store.js';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    if (!useAuthStore.getState().isAuthenticated()) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthenticatedRoute,
});

function AuthenticatedRoute() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
