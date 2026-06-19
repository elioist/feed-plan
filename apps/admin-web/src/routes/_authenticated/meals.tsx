import { createFileRoute } from '@tanstack/react-router';
import { mealQuerySchema } from '@feed-plan/shared';
import { mealQueries } from '~/features/meals/api';
import { MealListPage } from '~/pages/meals/MealListPage';

export const Route = createFileRoute('/_authenticated/meals')({
  validateSearch: (search) => mealQuerySchema.partial().parse(search),
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    await queryClient.ensureQueryData(mealQueries.list(deps));
  },
  component: MealListPage,
});
