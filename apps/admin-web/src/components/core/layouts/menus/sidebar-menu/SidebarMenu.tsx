import { useRouterState } from '@tanstack/react-router';
import { Layout, Menu } from 'antd';
import { AppConfig } from '~/config';
import { Logo } from '~/components/core/base/logo/Logo';
import { MenuThemeEnum, MenuWidth } from '~/enums/appEnum';
import { useSettingStore } from '~/store/modules/setting';
import {
  getActiveTopKey,
  getAuthorizedMenus,
  getOpenMenuKeys,
  getRouteMeta,
  type AdminMenuItem,
} from '~/components/core/layouts/navigation';
import { toMenuItems } from '~/components/core/layouts/menus/menu-items';
import { cn } from '@feed-plan/shared';
import { useAuthStore } from '~/store/modules/auth';

const { Sider } = Layout;

interface SidebarMenuProps {
  /** 显式指定渲染的菜单项（混合/双列布局传二级菜单）；默认渲染整棵导航树 */
  items?: AdminMenuItem[];
  /** 是否显示顶部 Logo（双列布局的二级栏不显示） */
  showLogo?: boolean;
}

export function SidebarMenu({ items, showLogo = true }: SidebarMenuProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeRoute = getRouteMeta(pathname);
  const user = useAuthStore((state) => state.user);
  const menuOpen = useSettingStore((state) => state.menuOpen);
  const menuOpenWidth = useSettingStore((state) => state.menuOpenWidth);
  const menuThemeType = useSettingStore((state) => state.menuThemeType);
  const isDark = menuThemeType === MenuThemeEnum.DARK;

  const menus = items ?? getAuthorizedMenus({ actions: user?.actions ?? [], menuKeys: user?.menuKeys ?? [] });

  return (
    <Sider
      width={menuOpenWidth}
      collapsedWidth={MenuWidth.CLOSE}
      collapsed={!menuOpen}
      collapsible
      trigger={null}
      theme={isDark ? 'dark' : 'light'}
      className={cn('layout-sidebar', !menuOpen && 'is-collapsed')}
    >
      <div className={cn('menu-left', `menu-left-${menuThemeType}`)}>
        {showLogo ? (
          <div className="header">
            <Logo />
            <p>{AppConfig.systemInfo.name}</p>
          </div>
        ) : null}
        <Menu
          mode="inline"
          theme={isDark ? 'dark' : 'light'}
          inlineCollapsed={!menuOpen}
          defaultOpenKeys={getOpenMenuKeys(pathname)}
          selectedKeys={[activeRoute.path, getActiveTopKey(pathname, menus)]}
          items={toMenuItems(menus)}
        />
      </div>
    </Sider>
  );
}
