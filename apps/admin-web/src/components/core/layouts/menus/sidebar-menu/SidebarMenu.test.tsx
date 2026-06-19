import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SidebarMenu } from '~/components/core/layouts/menus/sidebar-menu/SidebarMenu';

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

describe('SidebarMenu', () => {
  it('renders primary navigation entries with router links', async () => {
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
