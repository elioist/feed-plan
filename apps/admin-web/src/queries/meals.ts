import { queryOptions } from '@tanstack/react-query';
import type { MealQuery } from '@feed-plan/shared';
import { api } from '~/lib/api-client';

export const mealQueries = {
  list: (query: MealQuery = {}) =>
    queryOptions({
      queryKey: ['meals', query],
      queryFn: () => api.meals.list(query),
    }),
  today: (query: MealQuery = {}) =>
    queryOptions({
      queryKey: ['meals', 'today', query],
      queryFn: () => api.meals.listToday(query),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: ['meals', id],
      queryFn: () => api.meals.get(id),
    }),
};
