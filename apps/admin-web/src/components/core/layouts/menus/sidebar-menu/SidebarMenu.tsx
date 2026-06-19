import { Link, useRouterState } from '@tanstack/react-router';
import { Layout, Menu } from 'antd';
import type { ItemType } from 'antd/es/menu/interface';
import { AppConfig } from '~/config';
import { Logo } from '~/components/core/base/logo/Logo';
import { MenuWidth } from '~/enums/appEnum';
import { useSettingStore } from '~/store/modules/setting';
import {
  adminMenus,
  getOpenMenuKeys,
  getRouteMeta,
  type AdminMenuItem,
} from '~/components/core/layouts/navigation';

const { Sider } = Layout;

function toMenuItem(item: AdminMenuItem): ItemType {
  return {
    key: item.key,
    icon: item.icon,
    disabled: item.disabled,
    label: item.path ? <Link to={item.path}>{item.label}</Link> : item.label,
    children: item.children?.map(toMenuItem),
  };
}

export function SidebarMenu() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeRoute = getRouteMeta(pathname);
  const menuOpen = useSettingStore((state) => state.menuOpen);
  const menuOpenWidth = useSettingStore((state) => state.menuOpenWidth);

  return (
    <Sider
      width={menuOpenWidth}
      collapsedWidth={MenuWidth.CLOSE}
      collapsed={!menuOpen}
      collapsible
      trigger={null}
      theme="light"
      className={menuOpen ? 'layout-sidebar' : 'layout-sidebar is-collapsed'}
    >
      <div className="menu-left menu-left-design">
        <div className="header">
          <Logo />
          <p>{AppConfig.systemInfo.name}</p>
        </div>
        <Menu
          mode="inline"
          inlineCollapsed={!menuOpen}
          defaultOpenKeys={getOpenMenuKeys(pathname)}
          selectedKeys={[activeRoute.path]}
          items={adminMenus.map(toMenuItem)}
        />
      </div>
    </Sider>
  );
}
