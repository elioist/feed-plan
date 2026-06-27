import type {
  Category,
  CategoryListQuery,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@feed-plan/shared';

import type { ApiRequest } from '../types.js';

export function createCategoriesResource(request: ApiRequest) {
  return {
    list(query?: CategoryListQuery) {
      return request<Category[]>('/categories', { query });
    },
    create(input: CreateCategoryInput) {
      return request<Category>('/categories', {
        method: 'POST',
        body: input,
      });
    },
    update(id: string, input: UpdateCategoryInput) {
      return request<Category>(`/categories/${id}`, {
        method: 'PATCH',
        body: input,
      });
    },
    delete(id: string) {
      return request<{ ok: true }>(`/categories/${id}`, {
        method: 'DELETE',
      });
    },
  };
}
