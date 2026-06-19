import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  DownOutlined,
  PushpinFilled,
  PushpinOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useEffect } from 'react';
import { useSettingStore } from '~/store/modules/setting';
import { getRouteMeta, homeRoute, type AdminRoutePath } from '../navigation';
import { useWorkTabsStore } from './work-tabs-store';

function getNextPath(tabs: { path: AdminRoutePath }[], closingPath: AdminRoutePath) {
  const closingIndex = tabs.findIndex((item) => item.path === closingPath);
  const fallback = tabs[closingIndex - 1] ?? tabs[closingIndex + 1] ?? homeRoute;
  return fallback.path;
}

export function WorkTabs() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const activeRoute = getRouteMeta(pathname);
  const opened = useWorkTabsStore((state) => state.opened);
  const openTab = useWorkTabsStore((state) => state.openTab);
  const closeTab = useWorkTabsStore((state) => state.closeTab);
  const closeOtherTabs = useWorkTabsStore((state) => state.closeOtherTabs);
  const closeLeftTabs = useWorkTabsStore((state) => state.closeLeftTabs);
  const closeRightTabs = useWorkTabsStore((state) => state.closeRightTabs);
  const closeAllTabs = useWorkTabsStore((state) => state.closeAllTabs);
  const toggleFixedTab = useWorkTabsStore((state) => state.toggleFixedTab);
  const showWorkTab = useSettingStore((state) => state.showWorkTab);
  const reloadPage = useSettingStore((state) => state.reload);

  useEffect(() => {
    openTab({
      path: activeRoute.path,
      title: activeRoute.title,
      fixedTab: activeRoute.fixedTab,
    });
  }, [activeRoute, openTab]);

  const close = async (path: AdminRoutePath) => {
    const nextPath = getNextPath(opened, path);
    closeTab(path);
    if (activeRoute.path === path) {
      await navigate({ to: nextPath });
    }
  };

  const closeOther = async (path: AdminRoutePath) => {
    closeOtherTabs(path);
    if (activeRoute.path !== path) {
      await navigate({ to: path });
    }
  };

  const closeLeft = async (path: AdminRoutePath) => {
    const clickedIndex = opened.findIndex((item) => item.path === path);
    const activeIndex = opened.findIndex((item) => item.path === activeRoute.path);
    closeLeftTabs(path);
    if (activeIndex >= 0 && activeIndex < clickedIndex && !activeRoute.fixedTab) {
      await navigate({ to: path });
    }
  };

  const closeRight = async (path: AdminRoutePath) => {
    const clickedIndex = opened.findIndex((item) => item.path === path);
    const activeIndex = opened.findIndex((item) => item.path === activeRoute.path);
    closeRightTabs(path);
    if (activeIndex > clickedIndex && !activeRoute.fixedTab) {
      await navigate({ to: path });
    }
  };

  const closeAll = async () => {
    closeAllTabs();
    await navigate({ to: homeRoute.path });
  };

  const getMenuItems = (path: AdminRoutePath): MenuProps['items'] => {
    const tab = opened.find((item) => item.path === path);
    const index = opened.findIndex((item) => item.path === path);
    const leftClosable = opened.slice(0, index).some((item) => !item.fixedTab);
    const rightClosable = opened.slice(index + 1).some((item) => !item.fixedTab);
    const otherClosable = opened.some((item) => item.path !== path && !item.fixedTab);
    const allClosable = opened.some((item) => !item.fixedTab);

    return [
      {
        key: 'refresh',
        icon: <ReloadOutlined />,
        label: '刷新当前',
        disabled: activeRoute.path !== path,
        onClick: reloadPage,
      },
      {
        key: 'fixed',
        icon: <PushpinOutlined />,
        label: tab?.fixedTab ? '取消固定' : '固定标签',
        disabled: path === homeRoute.path,
        onClick: () => toggleFixedTab(path),
      },
      { type: 'divider' },
      {
        key: 'left',
        icon: <ArrowLeftOutlined />,
        label: '关闭左侧',
        disabled: !leftClosable,
        onClick: () => void closeLeft(path),
      },
      {
        key: 'right',
        icon: <ArrowRightOutlined />,
        label: '关闭右侧',
        disabled: !rightClosable,
        onClick: () => void closeRight(path),
      },
      {
        key: 'other',
        icon: <CloseOutlined />,
        label: '关闭其他',
        disabled: !otherClosable,
        onClick: () => void closeOther(path),
      },
      {
        key: 'all',
        icon: <CloseCircleOutlined />,
        label: '关闭全部',
        disabled: !allClosable,
        onClick: () => void closeAll(),
      },
      {
        key: 'current',
        icon: <CloseOutlined />,
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
    <div className="work-tabs">
      <div className="work-tabs-scroll">
        <ul className="work-tabs-list">
          {opened.map((item, index) => {
            const meta = getRouteMeta(item.path);
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
                  className={active ? 'work-tab activ-tab active' : 'work-tab'}
                >
                  <span className="work-tab-line" />
                  <Link className="work-tab-link" to={item.path}>
                    <span className="work-tab-icon">{meta.icon}</span>
                    <span>{item.title}</span>
                  </Link>
                  {item.fixedTab ? (
                    <PushpinFilled className="work-tab-pin" title="固定标签" />
                  ) : null}
                  {!item.fixedTab && opened.length > 1 ? (
                    <button
                      aria-label={'关闭 ' + item.title}
                      className="work-tab-close"
                      type="button"
                      onClick={() => void close(item.path)}
                    >
                      <CloseOutlined />
                    </button>
                  ) : null}
                </li>
              </Dropdown>
            );
          })}
        </ul>
      </div>
      <Dropdown menu={{ items: getMenuItems(activeRoute.path) }} trigger={['click']} placement="bottomRight">
        <Button className="work-tab-more" icon={<DownOutlined />} />
      </Dropdown>
    </div>
  );
}
