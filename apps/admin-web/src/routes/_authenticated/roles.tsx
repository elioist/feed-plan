import { createFileRoute, redirect } from '@tanstack/react-router';
import { RoleListPage } from '~/pages/roles/RoleListPage';
import { useAuthStore } from '~/store/modules/auth';

export const Route = createFileRoute('/_authenticated/roles')({
  beforeLoad: async () => {
    await useAuthStore.getState().restoreSession();
    if (useAuthStore.getState().user?.role !== 'chef') {
      throw redirect({ to: '/' });
    }
  },
  component: RoleListPage,
});
