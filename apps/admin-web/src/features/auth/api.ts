import type { AuthUser, LoginInput, LoginResponse } from '@feed-plan/shared';
import { apiClient } from '../../shared/api/client.js';

export function login(input: LoginInput) {
  return apiClient<LoginResponse>('/auth/login', {
    method: 'POST',
    body: input,
  });
}

export function getCurrentUser() {
  return apiClient<AuthUser>('/auth/me');
}
