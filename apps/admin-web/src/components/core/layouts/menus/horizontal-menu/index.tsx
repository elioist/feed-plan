import { useRouterState } from '@tanstack/react-router';
import { Menu } from 'antd';
import { useAuthStore } from '~/store/modules/auth';
import {
  buildMenusFromApi,
  getRouteMeta,
} from '~/routes/core/menu-processor';
import { toMenuItems } from '~/components/core/layouts/menus/menu-items';
import styles from './styles.module.scss';

/** 对应 Art Design Pro 的水平菜单布局。 */
export function HorizontalMenu() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const routeMenus = useAuthStore((state) => state.routeMenus);
  const menus = buildMenusFromApi(routeMenus);
  const activeRoute = getRouteMeta(pathname, menus);

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[activeRoute.path]}
      items={toMenuItems(menus)}
      className={styles.menu}
    />
  );
}
