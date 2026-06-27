import type {
  AccessListQuery,
  CreateRoleInput,
  Role,
  UpdateRoleMenusInput,
  UpdateRoleInput,
  UpdateRolePermissionsInput,
} from '@feed-plan/shared';

import type { ApiRequest } from '../types.js';

export function createRolesResource(request: ApiRequest) {
  return {
    list(query?: AccessListQuery) {
      return request<Role[]>('/roles', { query });
    },
    create(input: CreateRoleInput) {
      return request<Role>('/roles', {
        method: 'POST',
        body: input,
      });
    },
    update(id: string, input: UpdateRoleInput) {
      return request<Role>(`/roles/${id}`, {
        method: 'PATCH',
        body: input,
      });
    },
    updatePermissions(id: string, input: UpdateRolePermissionsInput) {
      return request<{ ok: true }>(`/roles/${id}/permissions`, {
        method: 'PATCH',
        body: input,
      });
    },
    updateMenus(id: string, input: UpdateRoleMenusInput) {
      return request<{ ok: true }>(`/roles/${id}/menu-access`, {
        method: 'PATCH',
        body: input,
      });
    },
    delete(id: string) {
      return request<{ ok: true }>(`/roles/${id}`, {
        method: 'DELETE',
      });
    },
  };
}
