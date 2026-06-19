import { Layout } from 'antd';
import type { PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '~/features/auth/store';
import { HeaderBar } from '~/components/core/layouts/header-bar/HeaderBar';
import { SidebarMenu } from '~/components/core/layouts/menus/sidebar-menu/SidebarMenu';
import { PageContent } from '~/components/core/layouts/page-content/PageContent';
import { WorkTabs } from '~/components/core/layouts/work-tabs/WorkTabs';

export function AppLayout({ children }: PropsWithChildren) {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  return (
    <Layout className="app-layout admin-shell">
      <aside id="app-sidebar">
        <SidebarMenu />
      </aside>
      <Layout id="app-main" className="admin-main">
        <div id="app-header" className="header-shell">
          <HeaderBar />
          <WorkTabs />
        </div>
        <PageContent contentRef={contentRef}>{children}</PageContent>
      </Layout>
    </Layout>
  );
}
