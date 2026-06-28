import type {
  AuthMenu,
  AuthUser,
  ChangePasswordInput,
  LoginInput,
  LoginResponse,
  UpdateUserInput,
} from '@feed-plan/shared';

import { uploadFile } from '../file-upload.js';
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
    menus() {
      return request<AuthMenu[]>('/auth/menus');
    },
    changePassword(input: ChangePasswordInput) {
      return request<{ ok: true }>('/auth/password', {
        method: 'PATCH',
        body: input,
      });
    },
    updateProfile(input: UpdateUserInput) {
      return request<AuthUser>('/auth/profile', {
        method: 'PATCH',
        body: input,
      });
    },
    uploadAvatar(file: File) {
      return uploadFile<{ path: string }>('/auth/avatar', file, request);
    },
  };
}
