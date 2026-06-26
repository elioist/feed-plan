import type { AddOrderInput, CurrentMealInput, MealQuery, MenuDetail } from '@feed-plan/shared';

import type { ApiRequest } from '../types.js';

export function createMealsResource(request: ApiRequest) {
  return {
    list(query: MealQuery = {}) {
      return request<MenuDetail[]>('/meals', { query });
    },
    listToday(query: MealQuery = {}) {
      return request<MenuDetail[]>('/meals/today', { query });
    },
    get(id: string) {
      return request<MenuDetail>(`/meals/${id}`);
    },
    getOrCreateCurrent(input: CurrentMealInput) {
      return request<MenuDetail>('/meals/current', {
        method: 'POST',
        body: input,
      });
    },
    addOrder(mealId: string, input: AddOrderInput) {
      return request<MenuDetail>(`/meals/${mealId}/orders`, {
        method: 'POST',
        body: input,
      });
    },
    complete(id: string) {
      return request<MenuDetail>(`/meals/${id}/complete`, {
        method: 'PATCH',
      });
    },
  };
}
