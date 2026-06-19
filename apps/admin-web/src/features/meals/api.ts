import { queryOptions } from '@tanstack/react-query';
import type { MealQuery, MenuDetail } from '@feed-plan/shared';
import { apiClient } from '../../shared/api/client.js';

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

export function listMeals(query: MealQuery = {}) {
  return apiClient<MenuDetail[]>('/meals', { query });
}

export function listTodayMeals(query: MealQuery = {}) {
  return apiClient<MenuDetail[]>('/meals/today', { query });
}

export function getMeal(id: string) {
  return apiClient<MenuDetail>(`/meals/${id}`);
}

export function completeMeal(id: string) {
  return apiClient<MenuDetail>(`/meals/${id}/complete`, {
    method: 'PATCH',
  });
}
