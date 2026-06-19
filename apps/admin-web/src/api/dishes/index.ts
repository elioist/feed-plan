import type {
  CreateDishInput,
  DishDetail,
  DishListQuery,
  DishSummary,
  UpdateDishActiveInput,
  UpdateDishInput,
} from '@feed-plan/shared';
import { apiClient } from '~/utils/http/client';

export function listDishes(query: DishListQuery = {}) {
  return apiClient<DishSummary[]>('/dishes', {
    query,
  });
}

export function getDish(id: string) {
  return apiClient<DishDetail>(`/dishes/${id}`);
}

export function createDish(input: CreateDishInput) {
  return apiClient<DishDetail>('/dishes', {
    method: 'POST',
    body: input,
  });
}

export function updateDish(id: string, input: UpdateDishInput) {
  return apiClient<DishDetail>(`/dishes/${id}`, {
    method: 'PATCH',
    body: input,
  });
}

export function setDishActive(id: string, input: UpdateDishActiveInput) {
  return apiClient<DishDetail>(`/dishes/${id}/active`, {
    method: 'PATCH',
    body: input,
  });
}

export function deleteDish(id: string) {
  return apiClient<{ ok: true }>(`/dishes/${id}`, {
    method: 'DELETE',
  });
}

export function uploadDishImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient<{ path: string }>('/uploads/images', {
    method: 'POST',
    body: formData,
  });
}
