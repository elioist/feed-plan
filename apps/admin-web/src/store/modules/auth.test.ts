import { adminStorageNS, type AuthUser } from '@feed-plan/shared';
import { ApiError } from '@feed-plan/api-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAccessToken } from '~/lib/storage';

const authApiMocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  menus: vi.fn(),
}));

vi.mock('~/lib/api-client', () => ({
  api: {
    auth: {
      login: authApiMocks.login,
      me: authApiMocks.getCurrentUser,
      menus: authApiMocks.menus,
    },
  },
}));

import { useAuthStore } from '~/store/modules/auth';
import { useWorkTabsStore } from '~/components/core/layouts/work-tabs/work-tabs-store';

const chef: AuthUser = {
  id: '11111111-1111-1111-1111-111111111111',
  username: 'chef',
  roles: [{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', key: 'chef', name: '主厨', description: null }],
  actions: ['users.manage'],
  menuKeys: [],
  buttonKeys: [],
};

describe('auth store', () => {
  const originalLocation = window.location;
  const locationAssign = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    locationAssign.mockReset();
    authApiMocks.getCurrentUser.mockReset();
    authApiMocks.login.mockReset();
    authApiMocks.menus.mockReset();
    authApiMocks.menus.mockResolvedValue([]);
    useAuthStore.setState({ accessToken: null, routeMenus: [], user: null });
    useWorkTabsStore.setState({ opened: [] });
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...originalLocation,
        assign: locationAssign,
      },
    });
  });

  it('saves the token and current user after login succeeds', async () => {
    authApiMocks.login.mockResolvedValue({ accessToken: 'test-token', user: chef });

    await useAuthStore.getState().login({ username: 'chef', password: 'secret' });

    expect(authApiMocks.login).toHaveBeenCalledWith({ username: 'chef', password: 'secret' });
    expect(getAccessToken()).toBe('test-token');
    expect(useAuthStore.getState().accessToken).toBe('test-token');
    expect(useAuthStore.getState().user).toEqual(chef);
  });

  it('clears the temporary token when menus fail after login succeeds', async () => {
    authApiMocks.login.mockResolvedValue({ accessToken: 'test-token', user: chef });
    authApiMocks.menus.mockRejectedValue(
      new ApiError({ message: 'Internal server error', status: 500 }),
    );

    await expect(
      useAuthStore.getState().login({ username: 'chef', password: 'secret' }),
    ).rejects.toThrow('登录成功，但菜单加载失败：Internal server error');

    expect(getAccessToken()).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().routeMenus).toEqual([]);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('keeps the local session empty after login fails', async () => {
    authApiMocks.login.mockRejectedValue(new Error('Unauthorized'));

    await expect(
      useAuthStore.getState().login({ username: 'chef', password: 'wrong' }),
    ).rejects.toThrow('Unauthorized');

    expect(getAccessToken()).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('clears the session and returns to login when logging out', () => {
    localStorage.setItem(adminStorageNS('access-token'), 'test-token');
    localStorage.setItem(
      adminStorageNS('work-tabs'),
      JSON.stringify({ state: { opened: [{ path: '/dishes', title: '菜谱管理' }] } }),
    );
    useAuthStore.setState({ accessToken: 'test-token', user: chef });
    useWorkTabsStore.setState({ opened: [{ path: '/dishes', title: '菜谱管理' }] });

    useAuthStore.getState().logout();

    expect(getAccessToken()).toBeNull();
    expect(localStorage.getItem(adminStorageNS('work-tabs'))).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useWorkTabsStore.getState().opened).toEqual([]);
    expect(locationAssign).toHaveBeenCalledWith('/login');
  });
});
