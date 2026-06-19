import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { AppLayout } from '~/components/core/layouts/app-layout/AppLayout';
import { useAuthStore } from '~/store/modules/auth';

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
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
