import type { AuthUser } from '@feed-plan/shared';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfilePage } from '~/pages/profile/ProfilePage';
import { useAuthStore } from '~/store/modules/auth';

const currentUser: AuthUser = {
  id: '11111111-1111-1111-1111-111111111111',
  username: 'chef',
  avatar: '/uploads/chef.webp',
  roles: [{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', key: 'chef', name: '主厨', description: null }],
  permissions: [],
  actions: [],
  menuKeys: [],
  buttonKeys: [],
};

const reactQueryMocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
}));

const routerMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

const apiMocks = vi.hoisted(() => ({
  changePassword: vi.fn(),
  getImageUrl: vi.fn((path: string | null) => path),
  updateProfile: vi.fn(),
  uploadAvatar: vi.fn(),
}));

const antdAppMocks = vi.hoisted(() => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: reactQueryMocks.useMutation,
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => routerMocks.navigate,
}));

vi.mock('antd-img-crop', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('~/lib/api-client', () => ({
  api: {
    auth: {
      changePassword: apiMocks.changePassword,
      updateProfile: apiMocks.updateProfile,
      uploadAvatar: apiMocks.uploadAvatar,
    },
    getImageUrl: apiMocks.getImageUrl,
  },
}));

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    App: {
      ...actual.App,
      useApp: () => ({ message: antdAppMocks.message }),
    },
  };
});

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.useRealTimers();
    useAuthStore.setState({ accessToken: 'token', user: currentUser });
    reactQueryMocks.useMutation.mockReset();
    reactQueryMocks.useMutation.mockImplementation((options) => ({
      isPending: false,
      mutate: async (input: unknown) => {
        try {
          const result = await options.mutationFn(input);
          await options.onSuccess?.(result, input, undefined);
        } catch (error) {
          options.onError?.(error, input, undefined);
        }
      },
    }));
    routerMocks.navigate.mockReset();
    apiMocks.changePassword.mockReset();
    apiMocks.updateProfile.mockReset();
    apiMocks.updateProfile.mockResolvedValue({ ...currentUser, username: 'chef-new' });
    antdAppMocks.message.error.mockReset();
    antdAppMocks.message.success.mockReset();
  });

  it('updates the current user after saving profile', async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    const usernameInput = screen.getByLabelText('用户名');
    await user.clear(usernameInput);
    await user.type(usernameInput, 'chef-new');
    await user.click(screen.getByRole('button', { name: '保存资料' }));

    await waitFor(() => {
      expect(apiMocks.updateProfile).toHaveBeenCalledWith({
        avatar: '/uploads/chef.webp',
        username: 'chef-new',
      });
    });
    expect(useAuthStore.getState().user?.username).toBe('chef-new');
    expect(antdAppMocks.message.success).toHaveBeenCalledWith('个人资料已更新');
  });

  it('prompts and redirects to login after changing password', async () => {
    const user = userEvent.setup();
    apiMocks.changePassword.mockResolvedValue({ ok: true });
    render(<ProfilePage />);

    await user.type(screen.getByLabelText('当前密码'), 'old-secret');
    await user.type(screen.getByLabelText('新密码'), 'new-secret');
    await user.type(screen.getByLabelText('确认新密码'), 'new-secret');
    await user.click(screen.getByRole('button', { name: '修改密码' }));

    await waitFor(() => {
      expect(apiMocks.changePassword).toHaveBeenCalledWith({
        currentPassword: 'old-secret',
        newPassword: 'new-secret',
      });
    });
    expect(antdAppMocks.message.success).toHaveBeenCalledWith('密码已修改，请重新登录');

    await waitFor(
      () => {
        expect(useAuthStore.getState().accessToken).toBeNull();
        expect(routerMocks.navigate).toHaveBeenCalledWith({
          to: '/login',
          search: { redirect: undefined },
          replace: true,
        });
      },
      { timeout: 1200 },
    );
  });
});
