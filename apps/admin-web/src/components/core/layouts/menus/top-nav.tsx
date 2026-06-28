import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Menu, Tooltip } from 'antd';
import { Logo } from '~/components/core/base/logo/Logo';
import { AppConfig } from '~/config';
import {
  buildMenusFromApi,
  findActiveTopKey,
  getFirstNavigableMenu,
  getRouteMeta,
  openExternalMenu,
} from '~/routes/core/menu-processor';
import { toMenuItems } from '~/components/core/layouts/menus/menu-items';
import { cn } from '@feed-plan/shared';
import { useAuthStore } from '~/store/modules/auth';

interface TopMenuProps {
  /** full：完整菜单横排（顶部布局）；groups：仅一级分组（混合布局，点击切换二级栏） */
  variant: 'full' | 'groups';
}

/** 顶部水平菜单 */
export function TopMenu({ variant }: TopMenuProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const routeMenus = useAuthStore((state) => state.routeMenus);
  const menus = buildMenusFromApi(routeMenus);
  const activeRoute = getRouteMeta(pathname, menus);

  if (variant === 'full') {
    return (
      <Menu
        mode="horizontal"
        selectedKeys={[activeRoute.path]}
        items={toMenuItems(menus)}
        className="top-menu"
      />
    );
  }

  const groupItems = menus.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
  }));

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[findActiveTopKey(pathname, menus)].filter((key): key is string => Boolean(key))}
      items={groupItems}
      className="top-menu"
      onClick={({ key }) => {
        const top = menus.find((item) => item.key === key);
        const target = top && getFirstNavigableMenu(top);
        if (target?.type === 'link') {
          openExternalMenu(target);
        } else if (target?.path) {
          void navigate({ to: target.path });
        }
      }}
    />
  );
}

/** 双列布局的一级图标栏 */
export function IconRail() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const routeMenus = useAuthStore((state) => state.routeMenus);
  const menus = buildMenusFromApi(routeMenus);
  const activeTop = findActiveTopKey(pathname, menus);

  return (
    <div className="icon-rail">
      <div className="icon-rail-logo">
        <Logo />
      </div>
      <div className="icon-rail-list">
        {menus.map((item) => {
          const target = getFirstNavigableMenu(item);
          return (
            <Tooltip key={item.key} title={item.label} placement="right">
              <button
                type="button"
                className={cn('icon-rail-item', item.key === activeTop && 'active')}
                disabled={item.disabled || !target}
                onClick={() => {
                  if (target?.type === 'link') {
                    openExternalMenu(target);
                  } else if (target?.path) {
                    void navigate({ to: target.path });
                  }
                }}
              >
                {item.icon}
              </button>
            </Tooltip>
          );
        })}
      </div>
      <div className="icon-rail-name">{AppConfig.systemInfo.name.slice(0, 1)}</div>
    </div>
  );
}
