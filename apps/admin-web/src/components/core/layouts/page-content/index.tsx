import { CloseOutlined, NotificationOutlined } from '@ant-design/icons';
import { Button, Layout } from 'antd';
import type { PropsWithChildren, RefObject } from 'react';
import { useState } from 'react';
import { BackToTop } from '~/components/core/base/back-to-top';
import { useSettingStore } from '~/store/modules/setting';
import styles from './styles.module.scss';

const { Content } = Layout;
const NOTICE_CLOSED_KEY = 'feed-plan.notice.closed';

interface PageContentProps extends PropsWithChildren {
  contentRef: RefObject<HTMLDivElement | null>;
}

export function PageContent({ children, contentRef }: PageContentProps) {
  const containerWidth = useSettingStore((state) => state.containerWidth);
  const refreshToken = useSettingStore((state) => state.refreshToken);
  const [noticeVisible, setNoticeVisible] = useState(() => {
    return window.localStorage.getItem(NOTICE_CLOSED_KEY) !== 'true';
  });

  const closeNotice = () => {
    window.localStorage.setItem(NOTICE_CLOSED_KEY, 'true');
    setNoticeVisible(false);
  };

  return (
    <Content ref={contentRef} id="app-content" className={styles.main}>
      <div className={styles.content} style={{ maxWidth: containerWidth }}>
        <div id="app-content-header">
          {noticeVisible ? (
            <div className={styles.notice}>
              <NotificationOutlined />
              <span>
                Feed Plan Pro
                已进入后台体验升级阶段，当前正在完善查询表格、用户权限、主题设置与菜品标签能力。
              </span>
              <Button
                aria-label="关闭全局通知"
                className={styles.noticeClose}
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
      <BackToTop targetId="app-main" />
    </Content>
  );
}
