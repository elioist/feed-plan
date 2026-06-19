import { ofetch } from 'ofetch';
import { env } from '~/config/env';
import { ApiError } from '~/utils/http/errors';
import { clearAccessToken, getAccessToken } from '~/utils/storage';

export const apiClient = ofetch.create({
  baseURL: env.apiBaseUrl,
  onRequest({ options }) {
    const token = getAccessToken();

    if (token) {
      options.headers = new Headers(options.headers);
      options.headers.set('Authorization', `Bearer ${token}`);
    }
  },
  onResponseError({ response }) {
    if (response.status === 401) {
      clearAccessToken();
    }

    const message =
      typeof response._data === 'object' && response._data && 'message' in response._data
        ? String(response._data.message)
        : '请求失败';

    throw new ApiError(message, response.status, response._data);
  },
});
