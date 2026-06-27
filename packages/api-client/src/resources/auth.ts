import type { AuthUser, ChangePasswordInput, LoginInput, LoginResponse } from '@feed-plan/shared';

import type { ApiRequest } from '../types.js';

export function createAuthResource(request: ApiRequest) {
  return {
    login(input: LoginInput) {
      return request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: input,
      });
    },
    me() {
      return request<AuthUser>('/auth/me');
    },
    changePassword(input: ChangePasswordInput) {
      return request<{ ok: true }>('/auth/password', {
        method: 'PATCH',
        body: input,
      });
    },
  };
}
