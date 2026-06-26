export const STORAGE_NS = {
  admin: 'feed-plan.admin',
  mobile: 'feed-plan.mobile',
} as const;

export type StorageNS = (typeof STORAGE_NS)[keyof typeof STORAGE_NS];

export function storageNS(namespace: StorageNS, key: string) {
  return `${namespace}.${key}`;
}

export function adminStorageNS(key: string) {
  return storageNS(STORAGE_NS.admin, key);
}

export function mobileStorageNS(key: string) {
  return storageNS(STORAGE_NS.mobile, key);
}
