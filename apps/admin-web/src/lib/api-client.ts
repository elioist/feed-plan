import { createApiClient } from '@feed-plan/api-client';
import { env } from '~/config/env';
import { clearAccessToken, getAccessToken } from '~/lib/storage';

export const api = createApiClient({
  baseURL: env.apiBaseUrl,
  getToken() {
    return getAccessToken();
  },
  onUnauthorized() {
    clearAccessToken();
  },
});

export const apiClient = api.request;
