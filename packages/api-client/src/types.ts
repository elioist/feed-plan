import type { FetchOptions } from 'ofetch';

export type MaybePromise<T> = T | Promise<T>;

export interface CreateApiClientOptions {
  baseURL: string;
  getToken?: () => MaybePromise<string | null | undefined>;
  onUnauthorized?: () => MaybePromise<void>;
  headers?: HeadersInit | (() => MaybePromise<HeadersInit | undefined>);
}

export type ApiRequestOptions = FetchOptions<'json'>;

export type ApiRequest = <T>(path: string, options?: ApiRequestOptions) => Promise<T>;
