import { NotificationOutlined } from '@ant-design/icons';
import { FloatButton, Layout } from 'antd';
import type { PropsWithChildren, RefObject } from 'react';
import { useSettingStore } from '~/store/modules/setting';

const { Content } = Layout;

interface PageContentProps extends PropsWithChildren {
  contentRef: RefObject<HTMLDivElement | null>;
}

export function PageContent({ children, contentRef }: PageContentProps) {
  const containerWidth = useSettingStore((state) => state.containerWidth);
  const refreshToken = useSettingStore((state) => state.refreshToken);

  return (
    <Content ref={contentRef} id="app-content" className="main-content">
      <div className="layout-content" style={{ maxWidth: containerWidth }}>
        <div id="app-content-header">
          <div className="admin-notice">
            <NotificationOutlined />
            <span>
              Feed Plan Pro 已进入后台体验升级阶段，当前正在完善查询表格、用户权限、主题设置与菜品标签能力。
            </span>
          </div>
        </div>
        <div key={refreshToken} className="page-view">
          {children}
        </div>
      </div>
      <FloatButton.BackTop
        target={() => document.getElementById('app-main') ?? contentRef.current ?? document.body}
      />
    </Content>
  );
}
