import { useCallback } from 'react';
import { useAuthStore } from '~/store/modules/auth';

const emptyButtonKeys: string[] = [];

export function useCanButton() {
  const buttonKeys = useAuthStore((state) => state.user?.buttonKeys ?? emptyButtonKeys);
  return useCallback((menuKey: string, buttonKey: string) => buttonKeys.includes(`${menuKey}.${buttonKey}`), [buttonKeys]);
}
