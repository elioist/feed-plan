import { createFileRoute } from '@tanstack/react-router';
import { CategoryListPage } from '../../pages/categories/CategoryListPage.js';
import { categoryQueries } from '../../features/categories/api.js';

export const Route = createFileRoute('/_authenticated/categories')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(categoryQueries.all());
  },
  component: CategoryListPage,
});
