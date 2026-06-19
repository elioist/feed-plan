import type { AuthUser } from '@feed-plan/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAccessToken } from './session.js';

const authApiMocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
}));

vi.mock('./api.js', () => authApiMocks);

import { useAuthStore } from './store.js';

const chef: AuthUser = {
  id: '11111111-1111-1111-1111-111111111111',
  username: 'chef',
  role: 'chef',
};

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear();
    authApiMocks.getCurrentUser.mockReset();
    authApiMocks.login.mockReset();
    useAuthStore.setState({ accessToken: null, user: null });
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
});
