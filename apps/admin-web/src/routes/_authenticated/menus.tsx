import { createFileRoute } from '@tanstack/react-router';
import { accessListQuerySchema } from '@feed-plan/shared';
import { MenuListPage } from '~/pages/menus/MenuListPage';
import { accessQueries } from '~/queries/access';

export const Route = createFileRoute('/_authenticated/menus')({
  validateSearch: (search) => accessListQuerySchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    await queryClient.ensureQueryData(accessQueries.menus(deps));
  },
  component: MenuListPage,
});
