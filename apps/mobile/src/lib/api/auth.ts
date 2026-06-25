import type { AuthUser, LoginInput, LoginResponse } from '@feed-plan/shared';
import { apiClient } from '../api-client';

export async function login(data: LoginInput): Promise<LoginResponse> {
  return apiClient<LoginResponse>('/auth/login', {
    method: 'POST',
    body: data,
  });
}

export async function getCurrentUser(): Promise<AuthUser> {
  return apiClient<AuthUser>('/auth/me');
}
