import type { ReactNode } from 'react';
import type { AuthMenu } from '@feed-plan/shared';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SidebarMenu } from '~/components/core/layouts/menus/sidebar-menu';
import { useAuthStore } from '~/store/modules/auth';

const routerMocks = vi.hoisted(() => ({
  pathname: '/dishes',
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a data-router-link="true" href={to}>
      {children}
    </a>
  ),
  useRouterState: vi.fn(({ select }) => select({ location: { pathname: routerMocks.pathname } })),
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useSuspenseQuery: () => ({ data: [] }),
  };
});

function authMenu(overrides: Partial<AuthMenu> & Pick<AuthMenu, 'key' | 'title'>): AuthMenu {
  return {
    id: `${overrides.key}-id`,
    parentId: null,
    path: null,
    icon: null,
    type: 'page',
    componentKey: null,
    externalUrl: null,
    openInNewTab: false,
    layoutKey: 'admin',
    isCache: false,
    isTabVisible: true,
    isAffix: false,
    activeMenuKey: null,
    sortOrder: 1,
    isVisible: true,
    isSystem: true,
    buttons: [],
    children: [],
    ...overrides,
  };
}

describe('SidebarMenu', () => {
  it('renders primary navigation entries with router links', async () => {
    useAuthStore.setState({
      user: {
        id: '11111111-1111-4111-8111-111111111111',
        username: 'chef',
        roles: [],
        actions: ['recipes.manage', 'meals.complete'],
        menuKeys: ['dashboard', 'recipes', 'recipes.categories', 'recipes.dishes', 'meals'],
        buttonKeys: [],
      },
      routeMenus: [
        authMenu({
          key: 'dashboard',
          title: '仪表盘',
          path: '/',
          componentKey: 'dashboard',
        }),
        authMenu({
          key: 'recipes',
          title: '菜谱中心',
          type: 'directory',
          children: [
            authMenu({
              key: 'recipes.categories',
              title: '分类管理',
              path: '/categories',
              componentKey: 'recipes.categories',
            }),
            authMenu({
              key: 'recipes.dishes',
              title: '菜谱管理',
              path: '/dishes',
              componentKey: 'recipes.dishes',
            }),
          ],
        }),
        authMenu({
          key: 'meals',
          title: '点菜菜单',
          path: '/meals',
          componentKey: 'meals',
        }),
      ],
    });

    render(<SidebarMenu />);

    expect(screen.getByRole('link', { name: '仪表盘' })).toHaveAttribute(
      'data-router-link',
      'true',
    );
    expect(await screen.findByRole('link', { name: '分类管理' })).toHaveAttribute(
      'data-router-link',
      'true',
    );
    expect(screen.getByRole('link', { name: '菜谱管理' })).toHaveAttribute(
      'data-router-link',
      'true',
    );
    expect(screen.getByRole('link', { name: '点菜菜单' })).toHaveAttribute(
      'data-router-link',
      'true',
    );
  });
});
