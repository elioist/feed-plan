import type { AuthUser } from '@feed-plan/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAccessToken } from '~/utils/storage';

const authApiMocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
}));

vi.mock('~/api/auth', () => authApiMocks);

import { useAuthStore } from '~/store/modules/auth';

const chef: AuthUser = {
  id: '11111111-1111-1111-1111-111111111111',
  username: 'chef',
  role: 'chef',
};

describe('auth store', () => {
  const originalLocation = window.location;
  const locationAssign = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    locationAssign.mockReset();
    authApiMocks.getCurrentUser.mockReset();
    authApiMocks.login.mockReset();
    useAuthStore.setState({ accessToken: null, user: null });
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
    localStorage.setItem('feed-plan.admin.access-token', 'test-token');
    useAuthStore.setState({ accessToken: 'test-token', user: chef });

    useAuthStore.getState().logout();

    expect(getAccessToken()).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(locationAssign).toHaveBeenCalledWith('/login');
  });
});
