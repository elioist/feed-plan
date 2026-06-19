import { createFileRoute } from '@tanstack/react-router';
import { DishListPage } from '~/pages/dishes/DishListPage';
import { dishListQuerySchema } from '@feed-plan/shared';
import { dishQueries } from '~/features/dishes/api';

export const Route = createFileRoute('/_authenticated/dishes')({
  validateSearch: (search) => dishListQuerySchema.partial().parse(search),
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    await queryClient.ensureQueryData(dishQueries.list(deps));
  },
  component: DishListPage,
});
