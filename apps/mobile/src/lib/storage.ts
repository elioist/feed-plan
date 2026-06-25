import { Platform } from 'react-native';

let SecureStore: typeof import('expo-secure-store') | null = null;

async function loadSecureStore() {
  if (SecureStore) return SecureStore;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  SecureStore = require('expo-secure-store');
  return SecureStore;
}

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    const store = await loadSecureStore();
    if (!store) return null;
    return store.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    const store = await loadSecureStore();
    if (!store) return;
    return store.setItemAsync(key, value);
  },

  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    const store = await loadSecureStore();
    if (!store) return;
    return store.deleteItemAsync(key);
  },
};

export default storage;
