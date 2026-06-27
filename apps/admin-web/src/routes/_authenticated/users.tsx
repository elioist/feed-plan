import { createFileRoute } from '@tanstack/react-router';
import { userListQuerySchema } from '@feed-plan/shared';
import { UserListPage } from '~/pages/users/UserListPage';
import { accessQueries } from '~/queries/access';
import { userQueries } from '~/queries/users';

export const Route = createFileRoute('/_authenticated/users')({
  validateSearch: (search) => userListQuerySchema.partial().parse(search),
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    await Promise.all([
      queryClient.ensureQueryData(userQueries.list(deps)),
      queryClient.ensureQueryData(accessQueries.roles()),
    ]);
  },
  component: UserListPage,
});
