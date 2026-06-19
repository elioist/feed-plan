import { CloseOutlined, NotificationOutlined } from '@ant-design/icons';
import { Button, FloatButton, Layout } from 'antd';
import type { PropsWithChildren, RefObject } from 'react';
import { useState } from 'react';
import { useSettingStore } from '~/store/modules/setting';

const { Content } = Layout;
const ADMIN_NOTICE_CLOSED_KEY = 'feed-plan-admin-notice-closed';

interface PageContentProps extends PropsWithChildren {
  contentRef: RefObject<HTMLDivElement | null>;
}

export function PageContent({ children, contentRef }: PageContentProps) {
  const containerWidth = useSettingStore((state) => state.containerWidth);
  const refreshToken = useSettingStore((state) => state.refreshToken);
  const [noticeVisible, setNoticeVisible] = useState(() => {
    return window.localStorage.getItem(ADMIN_NOTICE_CLOSED_KEY) !== 'true';
  });

  const closeNotice = () => {
    window.localStorage.setItem(ADMIN_NOTICE_CLOSED_KEY, 'true');
    setNoticeVisible(false);
  };

  return (
    <Content ref={contentRef} id="app-content" className="main-content">
      <div className="layout-content" style={{ maxWidth: containerWidth }}>
        <div id="app-content-header">
          {noticeVisible ? (
            <div className="admin-notice">
              <NotificationOutlined />
              <span>
                Feed Plan Pro
                已进入后台体验升级阶段，当前正在完善查询表格、用户权限、主题设置与菜品标签能力。
              </span>
              <Button
                aria-label="关闭全局通知"
                className="admin-notice-close"
                icon={<CloseOutlined />}
                size="small"
                type="text"
                onClick={closeNotice}
              />
            </div>
          ) : null}
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
