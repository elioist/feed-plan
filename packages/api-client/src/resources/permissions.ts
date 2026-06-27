import type {
  AccessListQuery,
  CreatePermissionInput,
  Permission,
  UpdatePermissionInput,
} from '@feed-plan/shared';

import type { ApiRequest } from '../types.js';

export function createPermissionsResource(request: ApiRequest) {
  return {
    list(query?: AccessListQuery) {
      return request<Permission[]>('/permissions', { query });
    },
    create(input: CreatePermissionInput) {
      return request<Permission>('/permissions', {
        method: 'POST',
        body: input,
      });
    },
    update(id: string, input: UpdatePermissionInput) {
      return request<Permission>(`/permissions/${id}`, {
        method: 'PATCH',
        body: input,
      });
    },
    delete(id: string) {
      return request<{ ok: true }>(`/permissions/${id}`, {
        method: 'DELETE',
      });
    },
  };
}
