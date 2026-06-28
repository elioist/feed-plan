import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RoleListPage } from '~/pages/roles/RoleListPage';
import { useAuthStore } from '~/store/modules/auth';

const roleId = '11111111-1111-4111-8111-111111111111';
const reactQueryMocks = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  useQuery: vi.fn(() => ({ data: undefined })),
  useMutation: vi.fn((options) => ({ isPending: false, mutate: options.mutationFn })),
  useSuspenseQuery: vi.fn(),
}));

const routerMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  search: {},
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: reactQueryMocks.useQuery,
  useMutation: reactQueryMocks.useMutation,
  useQueryClient: () => ({ invalidateQueries: reactQueryMocks.invalidateQueries }),
  useSuspenseQuery: reactQueryMocks.useSuspenseQuery,
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => routerMocks.navigate,
  useSearch: () => routerMocks.search,
}));

vi.mock('~/lib/api-client', () => ({
  api: {
    menus: { updateRoleAccess: vi.fn() },
    roles: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

vi.mock('~/queries/access', () => ({
  accessQueries: {
    roles: vi.fn(() => ({ queryKey: ['roles'], queryFn: vi.fn() })),
    menus: vi.fn(() => ({ queryKey: ['menus'], queryFn: vi.fn() })),
    roleMenuAccess: vi.fn(() => ({ queryKey: ['roles', 'role-menu-access'], queryFn: vi.fn() })),
  },
}));

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    App: {
      ...actual.App,
      useApp: () => ({ message: { error: vi.fn(), success: vi.fn() } }),
    },
    Drawer: ({ children, open, title }: { children: React.ReactNode; open: boolean; title: React.ReactNode }) =>
      open ? (
        <section aria-label={String(title)} role="dialog">
          {children}
        </section>
      ) : null,
  };
});

describe('RoleListPage', () => {
  it('renders roles with menu and button authorization summary', () => {
    useAuthStore.setState({
      accessToken: 'test-token',
      user: {
        id: '11111111-1111-4111-8111-111111111111',
        username: 'test-admin',
        roles: [],
        actions: [],
        menuKeys: [],
        buttonKeys: [
          'system.roles.create',
          'system.roles.edit',
          'system.roles.authorize',
          'system.roles.delete',
        ],
      },
    });
    reactQueryMocks.useSuspenseQuery
      .mockReturnValueOnce({
        data: [
          {
            id: roleId,
            key: 'kitchen.manager',
            name: '厨房管理员',
            description: '维护厨房资料',
            isSystem: false,
            menuIds: ['33333333-3333-4333-8333-333333333333'],
            buttonIds: ['44444444-4444-4444-8444-444444444444'],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: [],
        refetch: vi.fn(),
      });

    render(<RoleListPage />);

    expect(screen.getByText('厨房管理员')).toBeInTheDocument();
    expect(screen.getByText('kitchen.manager')).toBeInTheDocument();
    expect(screen.getByText('1 个菜单')).toBeInTheDocument();
    expect(screen.getByText('1 个按钮')).toBeInTheDocument();
  });
});
