import type { AuthUser, LoginInput } from '@feed-plan/shared';
import { create } from 'zustand';
import * as authApi from './api.js';
import { clearAccessToken, getAccessToken, setAccessToken } from './session.js';

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  clearSession: () => void;
  isAuthenticated: () => boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: getAccessToken(),
  user: null,
  clearSession: () => {
    clearAccessToken();
    set({ accessToken: null, user: null });
  },
  isAuthenticated: () => Boolean(get().accessToken),
  login: async (input) => {
    const response = await authApi.login(input);
    setAccessToken(response.accessToken);
    set({ accessToken: response.accessToken, user: response.user });
  },
  logout: () => {
    get().clearSession();
    window.location.assign('/login');
  },
  restoreSession: async () => {
    if (!get().accessToken || get().user) {
      return;
    }

    const user = await authApi.getCurrentUser();
    set({ user });
  },
}));
