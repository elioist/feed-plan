import type { ReactNode } from 'react';
import type { AuthMenu } from '@feed-plan/shared';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkTabs } from '~/components/core/layouts/work-tabs';
import { useAuthStore } from '~/store/modules/auth';
import { useWorkTabsStore } from '~/components/core/layouts/work-tabs/work-tabs-store';

const routerState = vi.hoisted(() => ({ pathname: '/dishes' }));

vi.mock('@iconify/react', () => ({
  Icon: ({ icon, className }: { icon: string; className?: string }) => (
    <span className={className} data-icon={icon} />
  ),
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, className }: { children: ReactNode; className?: string; to: string }) => (
    <a className={className} href={to}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
  useRouterState: vi.fn(({ select }) => select({ location: { pathname: routerState.pathname } })),
}));

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

describe('WorkTabs', () => {
  beforeEach(() => {
    routerState.pathname = '/dishes';
    useAuthStore.setState({ routeMenus: [] });
    useWorkTabsStore.setState({ opened: [] });
  });

  it('renders horizontal scroll controls', () => {
    useAuthStore.setState({
      routeMenus: [
        authMenu({ key: 'dashboard', title: '仪表盘', path: '/', componentKey: 'dashboard' }),
        authMenu({ key: 'dishes', title: '菜谱管理', path: '/dishes', componentKey: 'dishes' }),
      ],
    });
    useWorkTabsStore.setState({
      opened: [
        { path: '/', title: '仪表盘', fixedTab: true },
        { path: '/dishes', title: '菜谱管理' },
      ],
    });

    const { container } = render(<WorkTabs />);

    expect(screen.getByRole('button', { name: '向左滚动标签页' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '向右滚动标签页' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '向左滚动标签页' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '向右滚动标签页' })).toBeDisabled();
    const scrollShell = container.querySelector('.work-tabs-scroll');
    expect(scrollShell?.previousElementSibling).toHaveAccessibleName('向左滚动标签页');
    expect(scrollShell?.nextElementSibling).toHaveAccessibleName('向右滚动标签页');
  });

  it('keeps manual left scroll when the active tab is on the right', async () => {
    routerState.pathname = '/tab-8';
    const tabs = Array.from({ length: 9 }, (_, index) => ({
      path: `/tab-${index}`,
      title: `标签 ${index}`,
    }));
    useAuthStore.setState({
      routeMenus: tabs.map((tab, index) =>
        authMenu({
          key: `tab-${index}`,
          title: tab.title,
          path: tab.path,
          componentKey: `tab-${index}`,
        }),
      ),
    });
    useWorkTabsStore.setState({
      opened: tabs,
    });

    const offsetWidthSpy = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function getWidth(
      this: HTMLElement,
    ) {
      if (this.classList.contains('work-tabs-viewport')) return 300;
      if (this.classList.contains('work-tabs-list')) return 900;
      if (this.id.startsWith('scroll-li-')) return 100;
      return 0;
    });
    const offsetLeftSpy = vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function getLeft(
      this: HTMLElement,
    ) {
      if (this.id.startsWith('scroll-li-')) return Number(this.id.replace('scroll-li-', '')) * 100;
      return 0;
    });

    try {
      render(<WorkTabs />);

      const list = document.querySelector<HTMLElement>('.work-tabs-list');
      const leftButton = screen.getByRole('button', { name: '向左滚动标签页' });
      const rightButton = screen.getByRole('button', { name: '向右滚动标签页' });
      await waitFor(() => {
        expect(list).toHaveStyle({ transform: 'translateX(-600px)' });
        expect(leftButton).toBeEnabled();
        expect(rightButton).toBeDisabled();
      });

      fireEvent.click(leftButton);

      await waitFor(() => {
        expect(list).toHaveStyle({ transform: 'translateX(-420px)' });
        expect(leftButton).toBeEnabled();
        expect(rightButton).toBeEnabled();
      });
    } finally {
      offsetWidthSpy.mockRestore();
      offsetLeftSpy.mockRestore();
    }
  });

  it('opens the builtin profile page with its route meta title', async () => {
    routerState.pathname = '/profile';
    useWorkTabsStore.setState({
      opened: [
        { path: '/', title: '仪表盘', fixedTab: true },
        { path: '/profile', title: '页面' },
      ],
    });

    render(<WorkTabs />);

    await waitFor(() => {
      expect(useWorkTabsStore.getState().opened).toEqual([
        { path: '/', title: '仪表盘', fixedTab: true },
        { path: '/profile', title: '个人中心', fixedTab: undefined },
      ]);
    });
    expect(screen.queryByText('页面')).not.toBeInTheDocument();
    expect(screen.getByText('个人中心')).toBeInTheDocument();
  });
});
