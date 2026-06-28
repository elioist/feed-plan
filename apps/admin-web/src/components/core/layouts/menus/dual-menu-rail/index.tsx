import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Tooltip } from 'antd';
import { cn } from '@feed-plan/shared';
import { Logo } from '~/components/core/base/logo';
import { AppConfig } from '~/config';
import { useAuthStore } from '~/store/modules/auth';
import {
  buildMenusFromApi,
  findActiveTopKey,
  getFirstNavigableMenu,
  openExternalMenu,
} from '~/routes/core/menu-processor';
import styles from './styles.module.scss';

/** 双列菜单布局的一级图标栏。 */
export function DualMenuRail() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const routeMenus = useAuthStore((state) => state.routeMenus);
  const menus = buildMenusFromApi(routeMenus);
  const activeTop = findActiveTopKey(pathname, menus);

  return (
    <div className={styles.rail}>
      <div className={styles.logo}>
        <Logo />
      </div>
      <div className={styles.list}>
        {menus.map((item) => {
          const target = getFirstNavigableMenu(item);
          return (
            <Tooltip key={item.key} title={item.label} placement="right">
              <button
                type="button"
                className={cn(styles.item, item.key === activeTop && styles.active)}
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
      <div className={styles.name}>{AppConfig.systemInfo.name.slice(0, 1)}</div>
    </div>
  );
}
