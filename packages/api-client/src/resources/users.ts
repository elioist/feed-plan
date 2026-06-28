import type {
  AdminUser,
  CreateUserInput,
  ResetUserPasswordInput,
  UpdateUserInput,
  UpdateUserRolesInput,
  UserListQuery,
} from '@feed-plan/shared';

import type { ApiRequest } from '../types.js';

export function createUsersResource(request: ApiRequest) {
  return {
    list(query?: UserListQuery) {
      return request<AdminUser[]>('/users', { query });
    },
    create(input: CreateUserInput) {
      return request<AdminUser>('/users', {
        method: 'POST',
        body: input,
      });
    },
    updateRoles(id: string, input: UpdateUserRolesInput) {
      return request<AdminUser>(`/users/${id}`, {
        method: 'PATCH',
        body: input,
      });
    },
    resetPassword(id: string, input: ResetUserPasswordInput) {
      return request<{ ok: true }>(`/users/${id}/password`, {
        method: 'PATCH',
        body: input,
      });
    },
    updateProfile(id: string, input: UpdateUserInput) {
      return request<AdminUser>(`/users/${id}/profile`, {
        method: 'PATCH',
        body: input,
      });
    },
    delete(id: string) {
      return request<{ ok: true }>(`/users/${id}`, {
        method: 'DELETE',
      });
    },
  };
}
