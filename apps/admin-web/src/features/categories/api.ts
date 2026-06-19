import { queryOptions } from '@tanstack/react-query';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@feed-plan/shared';
import { apiClient } from '../../shared/api/client.js';

export const categoryQueries = {
  all: () =>
    queryOptions({
      queryKey: ['categories'],
      queryFn: () => listCategories(),
    }),
};

export function listCategories() {
  return apiClient<Category[]>('/categories');
}

export function createCategory(input: CreateCategoryInput) {
  return apiClient<Category>('/categories', {
    method: 'POST',
    body: input,
  });
}

export function updateCategory(id: string, input: UpdateCategoryInput) {
  return apiClient<Category>(`/categories/${id}`, {
    method: 'PATCH',
    body: input,
  });
}

export function deleteCategory(id: string) {
  return apiClient<{ ok: true }>(`/categories/${id}`, {
    method: 'DELETE',
  });
}
