import type { AdminUser, CreateUserInput, Role } from '@feed-plan/shared';
import { apiClient } from '~/utils/http/client';

export function listUsers() {
  return apiClient<AdminUser[]>('/users');
}

export function createUser(input: CreateUserInput) {
  return apiClient<AdminUser>('/users', {
    method: 'POST',
    body: input,
  });
}

export function updateUserRole(id: string, role: Role) {
  return apiClient<AdminUser>(`/users/${id}`, {
    method: 'PATCH',
    body: { role },
  });
}

export function deleteUser(id: string) {
  return apiClient<{ ok: true }>(`/users/${id}`, {
    method: 'DELETE',
  });
}
