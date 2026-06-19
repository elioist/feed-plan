/**
 * 本地存储工具
 *
 * 参考 art-design-pro 的 storage 表面（统一前缀、JSON 序列化、get/set/remove），
 * 但省去版本化迁移与兼容检查 —— 单用户家庭应用用不上。
 *
 * ponytail: 无版本迁移；将来需要多版本数据隔离时再补 key 版本前缀。
 */

const PREFIX = 'feed-plan.admin.';

export const storage = {
  get<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(PREFIX + key);
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
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  },

  remove(key: string): void {
    localStorage.removeItem(PREFIX + key);
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
