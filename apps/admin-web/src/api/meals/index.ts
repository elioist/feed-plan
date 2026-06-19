import type { MealQuery, MenuDetail } from '@feed-plan/shared';
import { apiClient } from '~/utils/http/client';

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
