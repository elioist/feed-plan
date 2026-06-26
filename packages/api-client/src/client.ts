import { resolveUrlWithBase } from '@feed-plan/shared';
import { ofetch } from 'ofetch';

import { ApiError, parseErrorData } from './errors.js';
import { createAuthResource } from './resources/auth.js';
import { createCategoriesResource } from './resources/categories.js';
import { createDishesResource } from './resources/dishes.js';
import { createMealsResource } from './resources/meals.js';
import { createUsersResource } from './resources/users.js';
import type { ApiRequest, CreateApiClientOptions } from './types.js';

export function createApiClient(options: CreateApiClientOptions) {
  const request = ofetch.create({
    baseURL: options.baseURL,
    async onRequest({ options: requestOptions }) {
      const headers = new Headers(requestOptions.headers);
      const extraHeaders =
        typeof options.headers === 'function' ? await options.headers() : options.headers;

      if (extraHeaders) {
        new Headers(extraHeaders).forEach((value, key) => headers.set(key, value));
      }

      const token = await options.getToken?.();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      requestOptions.headers = headers;
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        await options.onUnauthorized?.();
      }

      const parsed = parseErrorData(response._data);
      const message = parsed?.message || '请求失败';

      throw new ApiError({
        ...parsed,
        message: parsed?.reason ? `${message}: ${parsed.reason}` : message,
        status: response.status,
        data: response._data,
      });
    },
  }) as ApiRequest;

  return {
    request,
    getImageUrl(path: string | null) {
      if (!path) return null;
      if (path.startsWith('http')) return path;
      return resolveUrlWithBase(path, options.baseURL);
    },
    auth: createAuthResource(request),
    users: createUsersResource(request),
    categories: createCategoriesResource(request),
    dishes: createDishesResource(request),
    meals: createMealsResource(request),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
