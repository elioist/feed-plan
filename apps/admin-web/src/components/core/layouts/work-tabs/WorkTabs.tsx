import { Icon } from '@iconify/react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Button, Dropdown } from 'antd';
import { cn } from '@feed-plan/shared';
import type { MenuProps } from 'antd';
import { useEffect } from 'react';
import { useSettingStore } from '~/store/modules/setting';
import {
  buildMenusFromApi,
  getFirstRoutablePath,
  getRouteMeta,
} from '~/routes/core/menu-processor';
import { useWorkTabsStore } from '~/components/core/layouts/work-tabs/work-tabs-store';
import { useAuthStore } from '~/store/modules/auth';

function getNextPath(tabs: { path: string }[], closingPath: string, fallbackPath: string) {
  const closingIndex = tabs.findIndex((item) => item.path === closingPath);
  const fallback = tabs[closingIndex - 1] ?? tabs[closingIndex + 1];
  return fallback?.path ?? fallbackPath;
}

function lucideIcon(icon: string, size = 14) {
  return <Icon icon={icon} width={size} height={size} />;
}

export function WorkTabs() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const routeMenus = useAuthStore((state) => state.routeMenus);
  const menus = buildMenusFromApi(routeMenus);
  const fallbackPath = getFirstRoutablePath(menus);
  const activeRoute = getRouteMeta(pathname, menus);
  const opened = useWorkTabsStore((state) => state.opened);
  const openTab = useWorkTabsStore((state) => state.openTab);
  const closeTab = useWorkTabsStore((state) => state.closeTab);
  const closeOtherTabs = useWorkTabsStore((state) => state.closeOtherTabs);
  const closeLeftTabs = useWorkTabsStore((state) => state.closeLeftTabs);
  const closeRightTabs = useWorkTabsStore((state) => state.closeRightTabs);
  const closeAllTabs = useWorkTabsStore((state) => state.closeAllTabs);
  const toggleFixedTab = useWorkTabsStore((state) => state.toggleFixedTab);
  const showWorkTab = useSettingStore((state) => state.showWorkTab);
  const tabStyle = useSettingStore((state) => state.tabStyle);
  const reloadPage = useSettingStore((state) => state.reload);

  useEffect(() => {
    openTab({
      path: activeRoute.path,
      title: activeRoute.title,
      fixedTab: activeRoute.fixedTab,
    });
  }, [activeRoute.fixedTab, activeRoute.path, activeRoute.title, openTab]);

  const close = async (path: string) => {
    const nextPath = getNextPath(opened, path, fallbackPath);
    closeTab(path);
    if (activeRoute.path === path) {
      await navigate({ to: nextPath });
    }
  };

  const closeOther = async (path: string) => {
    closeOtherTabs(path);
    if (activeRoute.path !== path) {
      await navigate({ to: path });
    }
  };

  const closeLeft = async (path: string) => {
    const clickedIndex = opened.findIndex((item) => item.path === path);
    const activeIndex = opened.findIndex((item) => item.path === activeRoute.path);
    closeLeftTabs(path);
    if (activeIndex >= 0 && activeIndex < clickedIndex && !activeRoute.fixedTab) {
      await navigate({ to: path });
    }
  };

  const closeRight = async (path: string) => {
    const clickedIndex = opened.findIndex((item) => item.path === path);
    const activeIndex = opened.findIndex((item) => item.path === activeRoute.path);
    closeRightTabs(path);
    if (activeIndex > clickedIndex && !activeRoute.fixedTab) {
      await navigate({ to: path });
    }
  };

  const closeAll = async () => {
    closeAllTabs();
    await navigate({ to: fallbackPath });
  };

  const getMenuItems = (path: string): MenuProps['items'] => {
    const tab = opened.find((item) => item.path === path);
    const index = opened.findIndex((item) => item.path === path);
    const leftClosable = opened.slice(0, index).some((item) => !item.fixedTab);
    const rightClosable = opened.slice(index + 1).some((item) => !item.fixedTab);
    const otherClosable = opened.some((item) => item.path !== path && !item.fixedTab);
    const allClosable = opened.some((item) => !item.fixedTab);

    return [
      {
        key: 'refresh',
        icon: lucideIcon('lucide:refresh-cw'),
        label: '刷新当前',
        disabled: activeRoute.path !== path,
        onClick: reloadPage,
      },
      {
        key: 'fixed',
        icon: lucideIcon('lucide:pin'),
        label: tab?.fixedTab ? '取消固定' : '固定标签',
        disabled: false,
        onClick: () => toggleFixedTab(path),
      },
      { type: 'divider' },
      {
        key: 'left',
        icon: lucideIcon('lucide:arrow-left'),
        label: '关闭左侧',
        disabled: !leftClosable,
        onClick: () => void closeLeft(path),
      },
      {
        key: 'right',
        icon: lucideIcon('lucide:arrow-right'),
        label: '关闭右侧',
        disabled: !rightClosable,
        onClick: () => void closeRight(path),
      },
      {
        key: 'other',
        icon: lucideIcon('lucide:x'),
        label: '关闭其他',
        disabled: !otherClosable,
        onClick: () => void closeOther(path),
      },
      {
        key: 'all',
        icon: lucideIcon('lucide:circle-x'),
        label: '关闭全部',
        disabled: !allClosable,
        onClick: () => void closeAll(),
      },
      {
        key: 'current',
        icon: lucideIcon('lucide:x'),
        label: '关闭当前',
        disabled: Boolean(tab?.fixedTab),
        onClick: () => void close(path),
      },
    ];
  };

  if (!showWorkTab) {
    return null;
  }

  return (
    <div className={cn('work-tabs', tabStyle)}>
      <div className="work-tabs-scroll">
        <ul className="work-tabs-list">
          {opened.map((item, index) => {
            const meta = getRouteMeta(item.path, menus);
            const active = activeRoute.path === item.path;

            return (
              <Dropdown
                key={item.path}
                menu={{ items: getMenuItems(item.path) }}
                trigger={['contextMenu']}
                placement="bottomLeft"
              >
                <li
                  id={'scroll-li-' + index}
                  className={cn('work-tab', active && 'activ-tab active')}
                >
                  <span className="work-tab-line" />
                  <Link className="work-tab-link" to={item.path}>
                    <span className="work-tab-icon">{meta.icon}</span>
                    <span>{item.title}</span>
                  </Link>
                  {item.fixedTab ? (
                    <Icon className="work-tab-pin" icon="lucide:pin" width={12} height={12} aria-label="固定标签" />
                  ) : null}
                  {!item.fixedTab && opened.length > 1 ? (
                    <button
                      aria-label={'关闭 ' + item.title}
                      className="work-tab-close"
                      type="button"
                      onClick={() => void close(item.path)}
                    >
                      <Icon icon="lucide:x" width={12} height={12} />
                    </button>
                  ) : null}
                </li>
              </Dropdown>
            );
          })}
        </ul>
      </div>
      <Dropdown
        menu={{ items: getMenuItems(activeRoute.path) }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button className="work-tab-more" icon={lucideIcon('lucide:chevron-down')} />
      </Dropdown>
    </div>
  );
}
