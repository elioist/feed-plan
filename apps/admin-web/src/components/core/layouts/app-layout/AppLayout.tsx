import { Layout } from 'antd';
import type { PropsWithChildren, ReactNode } from 'react';
import { useRef } from 'react';
import { useAuthStore } from '~/store/modules/auth';
import { MenuTypeEnum } from '~/enums/appEnum';
import { useSettingStore } from '~/store/modules/setting';
import { HeaderBar } from '~/components/core/layouts/header-bar/HeaderBar';
import { SidebarMenu } from '~/components/core/layouts/menus/sidebar-menu/SidebarMenu';
import { IconRail, TopMenu } from '~/components/core/layouts/menus/top-nav';
import { PageContent } from '~/components/core/layouts/page-content/PageContent';
import { WorkTabs } from '~/components/core/layouts/work-tabs/WorkTabs';
import { useRouterState } from '@tanstack/react-router';
import {
  buildMenusFromApi,
  getActiveTopKey,
  getSubMenus,
} from '~/routes/core/menu-processor';

export function AppLayout({ children }: PropsWithChildren) {
  const routeMenus = useAuthStore((state) => state.routeMenus);
  const menuType = useSettingStore((state) => state.menuType);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const contentRef = useRef<HTMLDivElement>(null);

  const main = (
    <Layout id="app-main" className="admin-main">
      <div id="app-header" className="header-shell">
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
      <Layout className="app-layout layout-top">
        <div className="top-nav-bar">
          <TopMenu variant="full" />
        </div>
        {main}
      </Layout>
    );
  } else if (menuType === MenuTypeEnum.TOP_LEFT) {
    body = (
      <Layout className="app-layout layout-mixed">
        <div className="top-nav-bar">
          <TopMenu variant="groups" />
        </div>
        <Layout className="layout-mixed-body">
          <aside id="app-sidebar">
            <SidebarMenu items={subMenus} />
          </aside>
          {main}
        </Layout>
      </Layout>
    );
  } else if (menuType === MenuTypeEnum.DUAL_MENU) {
    body = (
      <Layout className="app-layout layout-dual">
        <IconRail />
        <aside id="app-sidebar">
          <SidebarMenu items={subMenus} showLogo={false} />
        </aside>
        {main}
      </Layout>
    );
  } else {
    body = (
      <Layout className="app-layout admin-shell layout-left">
        <aside id="app-sidebar">
          <SidebarMenu />
        </aside>
        {main}
      </Layout>
    );
  }

  return body;
}
