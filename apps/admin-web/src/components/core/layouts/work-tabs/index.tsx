import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Dropdown } from 'antd';
import { cn } from '@feed-plan/shared';
import type { MenuProps } from 'antd';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSettingStore } from '~/store/modules/setting';
import {
  buildMenusFromApi,
  getFirstRoutablePath,
  getRouteMeta,
} from '~/routes/core/menu-processor';
import { useWorkTabsStore } from '~/components/core/layouts/work-tabs/work-tabs-store';
import { useAuthStore } from '~/store/modules/auth';
import { SvgIcon } from '~/components/core/base/svg-icon';
import { IconButton } from '~/components/core/widget/icon-button';
import './styles.css';

function getNextPath(tabs: { path: string }[], closingPath: string, fallbackPath: string) {
  const closingIndex = tabs.findIndex((item) => item.path === closingPath);
  const fallback = tabs[closingIndex - 1] ?? tabs[closingIndex + 1];
  return fallback?.path ?? fallbackPath;
}

function lucideIcon(icon: string, size = 14) {
  return <SvgIcon icon={icon} width={size} height={size} />;
}

const SCROLL_EDGE_TOLERANCE = 1;

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const translateXRef = useRef(0);
  const [translateX, setTranslateX] = useState(0);
  const [scrolling, setScrolling] = useState(false);
  const [scrollBounds, setScrollBounds] = useState({ max: 0, min: 0 });

  const getTranslateBounds = useCallback(() => {
    const scrollWidth = scrollRef.current?.offsetWidth ?? 0;
    const listWidth = listRef.current?.offsetWidth ?? 0;
    return {
      max: 0,
      min: Math.min(scrollWidth - listWidth, 0),
    };
  }, []);

  const updateScrollBounds = useCallback(() => {
    const bounds = getTranslateBounds();
    setScrollBounds((current) =>
      current.max === bounds.max && current.min === bounds.min ? current : bounds,
    );
    return bounds;
  }, [getTranslateBounds]);

  const setBoundedTranslate = useCallback(
    (nextValue: number | ((current: number) => number)) => {
      const { max, min } = updateScrollBounds();
      setTranslateX((current) => {
        const resolved = typeof nextValue === 'function' ? nextValue(current) : nextValue;
        const bounded = Math.min(Math.max(resolved, min), max);
        translateXRef.current = bounded;
        return bounded;
      });
    },
    [updateScrollBounds],
  );

  const setRawTranslate = useCallback((nextValue: number) => {
    translateXRef.current = nextValue;
    setTranslateX(nextValue);
  }, []);

  const moveTabs = useCallback(
    (delta: number) => {
      setScrolling(true);
      setBoundedTranslate((current) => current - delta);
      window.setTimeout(() => setScrolling(false), 250);
    },
    [setBoundedTranslate],
  );

  const scrollLeft = () => moveTabs(-180);
  const scrollRight = () => moveTabs(180);
  const canScrollLeft =
    scrollBounds.min < 0 && translateX < scrollBounds.max - SCROLL_EDGE_TOLERANCE;
  const canScrollRight =
    scrollBounds.min < 0 && translateX > scrollBounds.min + SCROLL_EDGE_TOLERANCE;

  const handleWheel = (event: React.WheelEvent) => {
    const { min } = updateScrollBounds();
    if (min === 0) return;

    event.preventDefault();
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    moveTabs(delta);
  };

  useEffect(() => {
    if (activeRoute.isTabVisible === false) {
      closeTab(activeRoute.path);
      return;
    }

    openTab({
      path: activeRoute.path,
      title: activeRoute.title,
      fixedTab: activeRoute.fixedTab,
    });
  }, [
    activeRoute.fixedTab,
    activeRoute.isTabVisible,
    activeRoute.path,
    activeRoute.title,
    closeTab,
    openTab,
  ]);

  const autoPositionActiveTab = useCallback(() => {
    const activeIndex = opened.findIndex((item) => item.path === activeRoute.path);
    const activeElement = document.getElementById(`scroll-li-${activeIndex}`);
    const scrollElement = scrollRef.current;
    const listElement = listRef.current;

    if (!activeElement || !scrollElement || !listElement) return;

    const scrollWidth = scrollElement.offsetWidth;
    const listWidth = listElement.offsetWidth;
    setScrollBounds({ max: 0, min: Math.min(scrollWidth - listWidth, 0) });
    if (listWidth <= scrollWidth) {
      setRawTranslate(0);
      return;
    }

    const tabLeft = activeElement.offsetLeft;
    const tabRight = tabLeft + activeElement.offsetWidth;
    const visibleLeft = Math.abs(translateXRef.current);
    const visibleRight = visibleLeft + scrollWidth;

    if (tabLeft >= visibleLeft && tabRight <= visibleRight) return;

    const nextTranslate =
      tabRight > visibleRight
        ? Math.max(scrollWidth - tabRight - 6, scrollWidth - listWidth)
        : -tabLeft;

    setScrolling(true);
    setBoundedTranslate(nextTranslate);
    window.setTimeout(() => setScrolling(false), 250);
  }, [activeRoute.path, opened, setBoundedTranslate, setRawTranslate]);

  useLayoutEffect(() => {
    autoPositionActiveTab();
  }, [autoPositionActiveTab]);

  useLayoutEffect(() => {
    updateScrollBounds();
    setBoundedTranslate((current) => current);
  }, [opened.length, setBoundedTranslate, tabStyle, updateScrollBounds]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    const listElement = listRef.current;
    if (!scrollElement || !listElement || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      updateScrollBounds();
      setBoundedTranslate((current) => current);
    });
    observer.observe(scrollElement);
    observer.observe(listElement);
    return () => observer.disconnect();
  }, [setBoundedTranslate, updateScrollBounds]);

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
      <IconButton
        aria-label="向左滚动标签页"
        className="work-tab-action-button work-tab-scroll-button"
        disabled={!canScrollLeft}
        icon="lucide:chevron-left"
        onClick={scrollLeft}
      />
      <div className="work-tabs-scroll">
        <div ref={scrollRef} className="work-tabs-viewport" onWheel={handleWheel}>
          <ul
            ref={listRef}
            className={cn('work-tabs-list', scrolling && 'scrolling')}
            style={{ transform: `translateX(${translateX}px)` }}
          >
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
                      <SvgIcon
                        className="work-tab-pin"
                        icon="lucide:pin"
                        width={12}
                        height={12}
                        aria-label="固定标签"
                      />
                    ) : null}
                    {!item.fixedTab && opened.length > 1 ? (
                      <button
                        aria-label={'关闭 ' + item.title}
                        className="work-tab-close"
                        type="button"
                        onClick={() => void close(item.path)}
                      >
                        <SvgIcon icon="lucide:x" width={12} height={12} />
                      </button>
                    ) : null}
                  </li>
                </Dropdown>
              );
            })}
          </ul>
        </div>
      </div>
      <IconButton
        aria-label="向右滚动标签页"
        className="work-tab-action-button work-tab-scroll-button"
        disabled={!canScrollRight}
        icon="lucide:chevron-right"
        onClick={scrollRight}
      />
      <Dropdown
        menu={{ items: getMenuItems(activeRoute.path) }}
        trigger={['click']}
        placement="bottomRight"
      >
        <IconButton
          aria-label="标签页更多操作"
          className="work-tab-action-button work-tab-more"
          icon="lucide:chevron-down"
        />
      </Dropdown>
    </div>
  );
}
