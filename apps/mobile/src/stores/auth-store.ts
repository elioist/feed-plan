import { create } from 'zustand';
import type { AuthUser } from '@feed-plan/shared';
import storage from '~/lib/storage';
import { login as apiLogin, getCurrentUser } from '~/lib/api/auth';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (username: string, password: string) => {
    const response = await apiLogin({ username, password });
    await storage.setItem('access_token', response.accessToken);
    set({ user: response.user, isAuthenticated: true });
  },

  logout: async () => {
    await storage.deleteItem('access_token');
    set({ user: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    try {
      const token = await storage.getItem('access_token');
      if (!token) {
        set({ isLoading: false });
        return;
      }

      const user = await getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      await storage.deleteItem('access_token');
      set({ isLoading: false });
    }
  },
}));
