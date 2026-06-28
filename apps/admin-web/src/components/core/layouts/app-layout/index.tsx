import { Layout } from 'antd';
import type { PropsWithChildren, ReactNode } from 'react';
import { useRef } from 'react';
import { useAuthStore } from '~/store/modules/auth';
import { MenuTypeEnum } from '~/enums/appEnum';
import { useSettingStore } from '~/store/modules/setting';
import { HeaderBar } from '~/components/core/layouts/header-bar';
import { SidebarMenu } from '~/components/core/layouts/menus/sidebar-menu';
import { DualMenuRail } from '~/components/core/layouts/menus/dual-menu-rail';
import { HorizontalMenu } from '~/components/core/layouts/menus/horizontal-menu';
import { MixedMenu } from '~/components/core/layouts/menus/mixed-menu';
import { PageContent } from '~/components/core/layouts/page-content';
import { RouteProgress } from '~/components/core/layouts/route-progress';
import { WorkTabs } from '~/components/core/layouts/work-tabs';
import { useRouterState } from '@tanstack/react-router';
import {
  buildMenusFromApi,
  getActiveTopKey,
  getSubMenus,
} from '~/routes/core/menu-processor';
import styles from './styles.module.scss';

export function AppLayout({ children }: PropsWithChildren) {
  const routeMenus = useAuthStore((state) => state.routeMenus);
  const menuType = useSettingStore((state) => state.menuType);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const contentRef = useRef<HTMLDivElement>(null);

  const main = (
    <Layout id="app-main" className={styles.main}>
      <RouteProgress />
      <div id="app-header" className={styles.headerShell}>
        <HeaderBar />
        <WorkTabs />
      </div>
      <PageContent contentRef={contentRef}>{children}</PageContent>
    </Layout>
  );

  const dynamicMenus = buildMenusFromApi(routeMenus);
  const subMenus = getSubMenus(getActiveTopKey(pathname, dynamicMenus), dynamicMenus);

  let body: ReactNode;
  if (menuType === MenuTypeEnum.TOP) {
    body = (
      <Layout className={`${styles.layout} ${styles.topLayout}`}>
        <div className={styles.topNavBar}>
          <HorizontalMenu />
        </div>
        {main}
      </Layout>
    );
  } else if (menuType === MenuTypeEnum.TOP_LEFT) {
    body = (
      <Layout className={`${styles.layout} ${styles.mixedLayout}`}>
        <div className={styles.topNavBar}>
          <MixedMenu />
        </div>
        <Layout className={styles.mixedBody}>
          <aside id="app-sidebar">
            <SidebarMenu items={subMenus} />
          </aside>
          {main}
        </Layout>
      </Layout>
    );
  } else if (menuType === MenuTypeEnum.DUAL_MENU) {
    body = (
      <Layout className={`${styles.layout} ${styles.dualLayout}`}>
        <DualMenuRail />
        <aside id="app-sidebar">
          <SidebarMenu items={subMenus} showLogo={false} />
        </aside>
        {main}
      </Layout>
    );
  } else {
    body = (
      <Layout className={`${styles.layout} ${styles.shellLayout}`}>
        <aside id="app-sidebar">
          <SidebarMenu />
        </aside>
        {main}
      </Layout>
    );
  }

  return body;
}
