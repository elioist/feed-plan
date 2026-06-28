import type { AuthMenu, AuthUser, LoginInput } from '@feed-plan/shared';
import { create } from 'zustand';
import { api } from '~/lib/api-client';
import { getApiErrorMessage } from '~/lib/error-parser';
import { clearAccessToken, getAccessToken, setAccessToken } from '~/lib/storage';
import { clearWorkTabsCache } from '~/components/core/layouts/work-tabs/work-tabs-store';

interface AuthState {
  accessToken: string | null;
  routeMenus: AuthMenu[];
  user: AuthUser | null;
  clearSession: () => void;
  isAuthenticated: () => boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: getAccessToken(),
  routeMenus: [],
  user: null,
  clearSession: () => {
    clearAccessToken();
    clearWorkTabsCache();
    set({ accessToken: null, routeMenus: [], user: null });
  },
  isAuthenticated: () => Boolean(get().accessToken),
  login: async (input) => {
    const response = await api.auth.login(input);
    setAccessToken(response.accessToken);
    try {
      const routeMenus = await api.auth.menus();
      set({ accessToken: response.accessToken, routeMenus, user: response.user });
    } catch (error) {
      clearAccessToken();
      set({ accessToken: null, routeMenus: [], user: null });
      throw new Error(`登录成功，但菜单加载失败：${getApiErrorMessage(error)}`);
    }
  },
  logout: () => {
    get().clearSession();
    window.location.assign('/login');
  },
  restoreSession: async () => {
    if (!get().accessToken || get().user) {
      return;
    }

    const [user, routeMenus] = await Promise.all([api.auth.me(), api.auth.menus()]);
    set({ routeMenus, user });
  },
  setUser: (user) => set({ user }),
}));
