import { createFileRoute } from '@tanstack/react-router';
import { DishListPage } from '~/pages/dishes/DishListPage';
import { dishListQuerySchema, type DishListQuery } from '@feed-plan/shared';
import { dishQueries } from '~/queries/dishes';

const withDefaultDishSearch = (search: DishListQuery): DishListQuery => ({
  ...search,
  isActive: search.isActive ?? true,
});

export const Route = createFileRoute('/_authenticated/dishes')({
  validateSearch: (search) => dishListQuerySchema.partial().parse(search),
  loaderDeps: ({ search }) => withDefaultDishSearch(search),
  loader: async ({ context: { queryClient }, deps }) => {
    await queryClient.ensureQueryData(dishQueries.list(deps));
  },
  component: DishListPage,
});
