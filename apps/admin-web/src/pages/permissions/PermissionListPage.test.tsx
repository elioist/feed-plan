import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PermissionListPage } from '~/pages/permissions/PermissionListPage';
import { useAuthStore } from '~/store/modules/auth';

const permissionId = '22222222-2222-4222-8222-222222222222';

const reactQueryMocks = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  useMutation: vi.fn((options) => ({ isPending: false, mutate: options.mutationFn })),
  useSuspenseQuery: vi.fn(),
}));

const routerMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  search: {},
}));

vi.mock('@tanstack/react-query', () => ({
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
    permissions: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

vi.mock('~/queries/access', () => ({
  accessQueries: {
    permissions: vi.fn(() => ({ queryKey: ['permissions'], queryFn: vi.fn() })),
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

describe('PermissionListPage', () => {
  it('renders permissions on a dedicated management page', () => {
    useAuthStore.setState({
      accessToken: 'test-token',
      user: {
        id: '11111111-1111-4111-8111-111111111111',
        username: 'test-admin',
        roles: [],
        permissions: [],
        actions: [],
        menuKeys: [],
        buttonKeys: [
          'system.permissions.create',
          'system.permissions.edit',
          'system.permissions.delete',
        ],
      },
    });
    reactQueryMocks.useSuspenseQuery.mockReturnValue({
      data: [
        {
          id: permissionId,
          key: 'recipes.manage',
          name: '菜谱管理',
          description: '维护菜谱',
          isSystem: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      refetch: vi.fn(),
    });

    render(<PermissionListPage />);

    expect(screen.getByRole('button', { name: '新建权限点' })).toBeInTheDocument();
    expect(screen.getByText('菜谱管理')).toBeInTheDocument();
    expect(screen.getByText('recipes.manage')).toBeInTheDocument();
    expect(screen.getByText('维护菜谱')).toBeInTheDocument();
  });
});
