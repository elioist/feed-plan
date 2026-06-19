import { queryOptions } from '@tanstack/react-query';
import type { MealQuery } from '@feed-plan/shared';
import { getMeal, listMeals, listTodayMeals } from '~/api/meals';

export const mealQueries = {
  list: (query: MealQuery = {}) =>
    queryOptions({
      queryKey: ['meals', query],
      queryFn: () => listMeals(query),
    }),
  today: (query: MealQuery = {}) =>
    queryOptions({
      queryKey: ['meals', 'today', query],
      queryFn: () => listTodayMeals(query),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: ['meals', id],
      queryFn: () => getMeal(id),
    }),
};
