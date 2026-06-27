import { createFileRoute } from '@tanstack/react-router';
import { CategoryListPage } from '~/pages/categories/CategoryListPage';
import { categoryListQuerySchema } from '@feed-plan/shared';
import { categoryQueries } from '~/queries/categories';

export const Route = createFileRoute('/_authenticated/categories')({
  validateSearch: (search) => categoryListQuerySchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    await queryClient.ensureQueryData(categoryQueries.all(deps));
  },
  component: CategoryListPage,
});
