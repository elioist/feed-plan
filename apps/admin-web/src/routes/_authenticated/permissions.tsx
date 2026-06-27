import { createFileRoute } from '@tanstack/react-router';
import { accessListQuerySchema } from '@feed-plan/shared';
import { PermissionListPage } from '~/pages/permissions/PermissionListPage';
import { accessQueries } from '~/queries/access';

export const Route = createFileRoute('/_authenticated/permissions')({
  validateSearch: (search) => accessListQuerySchema.partial().parse(search),
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    await queryClient.ensureQueryData(accessQueries.permissions(deps));
  },
  component: PermissionListPage,
});
