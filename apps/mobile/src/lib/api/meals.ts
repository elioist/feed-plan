import type { Meal, MealType } from '@feed-plan/shared';
import { apiClient } from '../api-client';

export interface MealListParams {
  mealDate?: string;
  mealType?: MealType;
  status?: 'ordering' | 'completed';
}

export async function getMeals(params?: MealListParams): Promise<Meal[]> {
  const query = new URLSearchParams();
  if (params?.mealDate) query.set('mealDate', params.mealDate);
  if (params?.mealType) query.set('mealType', params.mealType);
  if (params?.status) query.set('status', params.status);

  const queryString = query.toString();
  return apiClient<Meal[]>(`/meals${queryString ? `?${queryString}` : ''}`);
}

export async function getMealDetail(id: string): Promise<Meal> {
  return apiClient<Meal>(`/meals/${id}`);
}

export async function createMeal(data: {
  title?: string;
  mealType: MealType;
}): Promise<Meal> {
  return apiClient<Meal>('/meals', {
    method: 'POST',
    body: data,
  });
}

export async function completeMeal(id: string): Promise<Meal> {
  return apiClient<Meal>(`/meals/${id}/complete`, {
    method: 'PATCH',
  });
}
