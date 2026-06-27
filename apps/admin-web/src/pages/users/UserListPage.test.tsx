import type { AdminUser, AuthUser } from '@feed-plan/shared';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserListPage } from '~/pages/users/UserListPage';
import { useAuthStore } from '~/store/modules/auth';

const currentUser: AuthUser = {
  id: '11111111-1111-1111-1111-111111111111',
  username: 'chef',
  roles: [{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', key: 'chef', name: '主厨', description: null }],
  permissions: [],
  actions: ['users.manage'],
  menuKeys: [],
  buttonKeys: [
    'system.users.create',
    'system.users.edit-roles',
    'system.users.reset-password',
    'system.users.delete',
  ],
};
const dinerRole = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  key: 'diner',
  name: '食客',
  description: null,
};

const users: AdminUser[] = [
  {
    ...currentUser,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    username: 'diner',
    roles: [dinerRole],
    permissions: [],
    actions: [],
    menuKeys: [],
    buttonKeys: [],
    createdAt: new Date('2026-01-02T00:00:00.000Z'),
  },
];

const reactQueryMocks = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  useMutation: vi.fn(),
  useSuspenseQuery: vi.fn(),
}));

const routerMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  search: {},
}));

const userApiMocks = vi.hoisted(() => ({
  create: vi.fn(),
  delete: vi.fn(),
  resetPassword: vi.fn(),
  updateRoles: vi.fn(),
  userQueries: {
    all: vi.fn(() => ({ queryKey: ['users'] })),
    list: vi.fn(() => ({ queryKey: ['users'], queryFn: vi.fn() })),
  },
}));

const antdAppMocks = vi.hoisted(() => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: reactQueryMocks.useMutation,
  useQueryClient: () => ({
    invalidateQueries: reactQueryMocks.invalidateQueries,
  }),
  useSuspenseQuery: reactQueryMocks.useSuspenseQuery,
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => routerMocks.navigate,
  useSearch: () => routerMocks.search,
}));

vi.mock('~/lib/api-client', () => ({
  api: {
    users: {
      create: userApiMocks.create,
      delete: userApiMocks.delete,
      resetPassword: userApiMocks.resetPassword,
      updateRoles: userApiMocks.updateRoles,
    },
  },
}));

vi.mock('~/queries/users', () => ({
  userQueries: userApiMocks.userQueries,
}));

vi.mock('~/queries/access', () => ({
  accessQueries: {
    roles: vi.fn(() => ({ queryKey: ['roles'], queryFn: vi.fn() })),
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
    Drawer: ({
      children,
      open,
      title,
    }: {
      children: React.ReactNode;
      open: boolean;
      title: React.ReactNode;
    }) =>
      open ? (
        <section aria-label={String(title)} role="dialog">
          {children}
        </section>
      ) : null,
    Popconfirm: ({ children, onConfirm }: { children: React.ReactNode; onConfirm: () => void }) => (
      <span>
        {children}
        <button type="button" onClick={onConfirm}>
          确认删除
        </button>
      </span>
    ),
  };
});

describe('UserListPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: 'token', user: currentUser });
    reactQueryMocks.invalidateQueries.mockReset();
    reactQueryMocks.useSuspenseQuery.mockReset();
    reactQueryMocks.useSuspenseQuery.mockImplementation((options) => {
      if (options.queryKey[0] === 'roles') {
        return {
          data: [
            { ...currentUser.roles[0], permissions: [], isSystem: true, createdAt: new Date(), updatedAt: new Date() },
            { ...dinerRole, permissions: [], isSystem: true, createdAt: new Date(), updatedAt: new Date() },
          ],
          refetch: vi.fn(),
        };
      }
      return { data: users, refetch: vi.fn() };
    });
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

    userApiMocks.create.mockReset();
    userApiMocks.delete.mockReset();
    userApiMocks.resetPassword.mockReset();
    userApiMocks.resetPassword.mockResolvedValue({ ok: true });
    userApiMocks.updateRoles.mockReset();
    userApiMocks.userQueries.all.mockClear();
    userApiMocks.userQueries.list.mockClear();
    antdAppMocks.message.error.mockReset();
    antdAppMocks.message.success.mockReset();
  });

  it('renders users and disables dangerous self operations', () => {
    render(<UserListPage />);

    expect(screen.getByText('chef')).toBeInTheDocument();
    expect(screen.getByText('diner')).toBeInTheDocument();
    expect(screen.getByText('本人')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '重置密码' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '删除' })).toBeInTheDocument();
  });

  it('resets another user password and shows success feedback', async () => {
    const user = userEvent.setup();
    render(<UserListPage />);

    await user.click(screen.getByRole('button', { name: '重置密码' }));
    const dialog = await screen.findByRole('dialog', { name: '重置 diner 的密码' });
    await user.type(within(dialog).getByLabelText('新密码'), 'new-secret');
    await user.click(within(dialog).getByRole('button', { name: /保\s*存/ }));

    await waitFor(() => {
      expect(userApiMocks.resetPassword).toHaveBeenCalledWith(users[1]!.id, {
        password: 'new-secret',
      });
    });
    expect(reactQueryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['users'] });
    expect(antdAppMocks.message.success).toHaveBeenCalledWith('密码已重置');
  });
});
