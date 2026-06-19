import { createFileRoute } from '@tanstack/react-router';
import { mealQueries } from '../../features/meals/api.js';
import { MealDetailPage } from '../../pages/meals/MealDetailPage.js';

export const Route = createFileRoute('/_authenticated/meals/$mealId')({
  loader: async ({ context: { queryClient }, params }) => {
    await queryClient.ensureQueryData(mealQueries.detail(params.mealId));
  },
  component: MealDetailPage,
});
