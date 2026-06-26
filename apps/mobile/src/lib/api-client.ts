import {
  createApiClient,
  getApiErrorInfo,
  getApiErrorMessage,
  type ApiErrorInfo,
} from '@feed-plan/api-client';
import storage from './storage';

export const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'http://localhost:3000';

export const api = createApiClient({
  baseURL: API_BASE,
  getToken() {
    return storage.getItem('access_token');
  },
  onUnauthorized() {
    return storage.deleteItem('access_token');
  },
});

export const apiClient = api.request;
export const getImageUrl = api.getImageUrl;
export { getApiErrorInfo, getApiErrorMessage };
export type { ApiErrorInfo };
