import { createFileRoute, redirect } from '@tanstack/react-router';
import { UserListPage } from '~/pages/users/UserListPage';
import { userQueries } from '~/queries/users';
import { useAuthStore } from '~/store/modules/auth';

export const Route = createFileRoute('/_authenticated/users')({
  beforeLoad: async () => {
    await useAuthStore.getState().restoreSession();
    if (useAuthStore.getState().user?.role !== 'chef') {
      throw redirect({ to: '/' });
    }
  },
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(userQueries.all());
  },
  component: UserListPage,
});
