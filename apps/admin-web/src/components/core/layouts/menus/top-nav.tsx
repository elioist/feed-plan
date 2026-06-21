import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Menu, Tooltip } from 'antd';
import { Logo } from '~/components/core/base/logo/Logo';
import { AppConfig } from '~/config';
import {
  adminMenus,
  getActiveTopKey,
  getRouteMeta,
  type AdminMenuItem,
  type AdminRoutePath,
} from '~/components/core/layouts/navigation';
import { toMenuItems } from '~/components/core/layouts/menus/menu-items';

/** 取菜单项可跳转的首个路径（自身或第一个有 path 的子项） */
function firstPath(item: AdminMenuItem): AdminRoutePath | undefined {
  return item.path ?? item.children?.find((child) => child.path)?.path;
}

interface TopMenuProps {
  /** full：完整菜单横排（顶部布局）；groups：仅一级分组（混合布局，点击切换二级栏） */
  variant: 'full' | 'groups';
}

/** 顶部水平菜单 */
export function TopMenu({ variant }: TopMenuProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const activeRoute = getRouteMeta(pathname);

  if (variant === 'full') {
    return (
      <Menu
        mode="horizontal"
        selectedKeys={[activeRoute.path]}
        items={toMenuItems(adminMenus)}
        className="top-menu"
      />
    );
  }

  const groupItems = adminMenus.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
  }));

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[getActiveTopKey(pathname)]}
      items={groupItems}
      className="top-menu"
      onClick={({ key }) => {
        const top = adminMenus.find((item) => item.key === key);
        const path = top && firstPath(top);
        if (path) {
          void navigate({ to: path });
        }
      }}
    />
  );
}

/** 双列布局的一级图标栏 */
export function IconRail() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const activeTop = getActiveTopKey(pathname);

  return (
    <div className="icon-rail">
      <div className="icon-rail-logo">
        <Logo />
      </div>
      <div className="icon-rail-list">
        {adminMenus.map((item) => {
          const path = firstPath(item);
          return (
            <Tooltip key={item.key} title={item.label} placement="right">
              <button
                type="button"
                className={item.key === activeTop ? 'icon-rail-item active' : 'icon-rail-item'}
                disabled={item.disabled || !path}
                onClick={() => path && void navigate({ to: path })}
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
