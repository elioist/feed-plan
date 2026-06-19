import { createFileRoute } from '@tanstack/react-router';
import { CategoryListPage } from '~/pages/categories/CategoryListPage';
import { categoryQueries } from '~/features/categories/api';

export const Route = createFileRoute('/_authenticated/categories')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(categoryQueries.all());
  },
  component: CategoryListPage,
});
