import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '~/lib/api-client';
import { clearAccessToken, getAccessToken, setAccessToken } from '~/lib/storage';

describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearAccessToken();
  });

  it('clears the stored access token when the API returns 401', async () => {
    setAccessToken('expired-token');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(JSON.stringify({ message: '登录已过期' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 401,
        });
      }),
    );

    await expect(apiClient('/auth/me')).rejects.toMatchObject({
      message: '登录已过期',
      status: 401,
    });

    expect(getAccessToken()).toBeNull();
  });
});
