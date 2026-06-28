import { adminStorageNS } from '@feed-plan/shared';

/** 后台端本地存储封装：统一前缀、JSON 序列化、get/set/remove。 */

export const storage = {
  get<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(adminStorageNS(key));
    if (raw === null) {
      return fallback;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  set(key: string, value: unknown): void {
    localStorage.setItem(adminStorageNS(key), JSON.stringify(value));
  },

  remove(key: string): void {
    localStorage.removeItem(adminStorageNS(key));
  },
};

const ACCESS_TOKEN_KEY = 'access-token';

export function getAccessToken(): string | null {
  return storage.get<string | null>(ACCESS_TOKEN_KEY, null);
}

export function setAccessToken(token: string): void {
  storage.set(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  storage.remove(ACCESS_TOKEN_KEY);
}
