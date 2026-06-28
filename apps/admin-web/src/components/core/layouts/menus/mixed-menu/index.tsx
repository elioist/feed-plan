import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Menu } from 'antd';
import { useAuthStore } from '~/store/modules/auth';
import {
  buildMenusFromApi,
  findActiveTopKey,
  getFirstNavigableMenu,
  openExternalMenu,
} from '~/routes/core/menu-processor';
import styles from './styles.module.scss';

/** 对应 Art Design Pro 混合布局顶部一级菜单。 */
export function MixedMenu() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const routeMenus = useAuthStore((state) => state.routeMenus);
  const menus = buildMenusFromApi(routeMenus);

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
      className={styles.menu}
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
