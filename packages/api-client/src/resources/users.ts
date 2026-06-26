import type { AdminUser, CreateUserInput, Role } from '@feed-plan/shared';

import type { ApiRequest } from '../types.js';

export function createUsersResource(request: ApiRequest) {
  return {
    list() {
      return request<AdminUser[]>('/users');
    },
    create(input: CreateUserInput) {
      return request<AdminUser>('/users', {
        method: 'POST',
        body: input,
      });
    },
    updateRole(id: string, role: Role) {
      return request<AdminUser>(`/users/${id}`, {
        method: 'PATCH',
        body: { role },
      });
    },
    delete(id: string) {
      return request<{ ok: true }>(`/users/${id}`, {
        method: 'DELETE',
      });
    },
  };
}
