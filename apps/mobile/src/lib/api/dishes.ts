import type { DishDetail, DishSummary } from '@feed-plan/shared';
import { apiClient } from '../api-client';

export interface DishListParams {
  categoryId?: string;
  isActive?: boolean;
  search?: string;
}

export async function getDishes(params?: DishListParams): Promise<DishSummary[]> {
  const query = new URLSearchParams();
  if (params?.categoryId) query.set('categoryId', params.categoryId);
  if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));
  if (params?.search) query.set('search', params.search);

  const queryString = query.toString();
  return apiClient<DishSummary[]>(`/dishes${queryString ? `?${queryString}` : ''}`);
}

export async function getDishDetail(id: string): Promise<DishDetail> {
  return apiClient<DishDetail>(`/dishes/${id}`);
}
