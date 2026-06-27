import type {
  CreateDishInput,
  DishDetail,
  DishListQuery,
  DishSummary,
  UpdateDishActiveInput,
  UpdateDishInput,
} from '@feed-plan/shared';

import type { ApiRequest } from '../types.js';
import { uploadFile } from '../file-upload.js';

export function createDishesResource(request: ApiRequest) {
  return {
    list(query: DishListQuery = {}) {
      return request<DishSummary[]>('/dishes', { query });
    },
    get(id: string) {
      return request<DishDetail>(`/dishes/${id}`);
    },
    create(input: CreateDishInput) {
      return request<DishDetail>('/dishes', {
        method: 'POST',
        body: input,
      });
    },
    update(id: string, input: UpdateDishInput) {
      return request<DishDetail>(`/dishes/${id}`, {
        method: 'PATCH',
        body: input,
      });
    },
    setActive(id: string, input: UpdateDishActiveInput) {
      return request<DishDetail>(`/dishes/${id}/active`, {
        method: 'PATCH',
        body: input,
      });
    },
    delete(id: string) {
      return request<{ ok: true }>(`/dishes/${id}`, {
        method: 'DELETE',
      });
    },
    uploadImage(file: File) {
      return uploadFile<{ path: string }>('/uploads/images', file, request);
    },
  };
}
