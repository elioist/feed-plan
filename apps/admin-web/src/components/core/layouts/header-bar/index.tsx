import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Button, Dropdown, Empty, Layout, List, Popover, Tooltip, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { useMemo, useState } from 'react';
import { AppConfig } from '~/config';
import { SystemThemeEnum } from '~/enums/appEnum';
import { runThemeTransition } from '~/lib/theme-transition';
import { useSettingStore } from '~/store/modules/setting';
import { SettingsPanel } from '~/components/core/layouts/settings-panel';
import { SvgIcon } from '~/components/core/base/svg-icon';
import {
  buildMenusFromApi,
  getRoutableRouteMeta,
  getRouteMeta,
  type AdminRoutePath,
} from '~/routes/core/menu-processor';
import { UserMenu } from '~/components/core/layouts/header-bar/widget/user-menu';
import { useAuthStore } from '~/store/modules/auth';
import { Breadcrumb } from '~/components/core/layouts/breadcrumb';
import { FastEnter } from '~/components/core/layouts/fast-enter';
import { GlobalSearch } from '~/components/core/layouts/global-search';
import styles from './styles.module.scss';

const { Header } = Layout;

export function HeaderBar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const routeMenus = useAuthStore((state) => state.routeMenus);
  const dynamicMenus = buildMenusFromApi(routeMenus);
  const activeRoute = getRouteMeta(pathname, dynamicMenus);
  const menuOpen = useSettingStore((state) => state.menuOpen);
  const toggleMenuOpen = useSettingStore((state) => state.toggleMenuOpen);
  const reloadPage = useSettingStore((state) => state.reload);
  const systemThemeType = useSettingStore((state) => state.systemThemeType);
  const toggleTheme = useSettingStore((state) => state.toggleTheme);
  const showMenuButton = useSettingStore((state) => state.showMenuButton);
  const showRefreshButton = useSettingStore((state) => state.showRefreshButton);
  const showFastEnter = useSettingStore((state) => state.showFastEnter);
  const showCrumbs = useSettingStore((state) => state.showCrumbs);
  const showLanguage = useSettingStore((state) => state.showLanguage);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);

  const headerConfig = AppConfig.headerBar;

  const reload = () => {
    reloadPage();
    document.getElementById('app-main')?.scrollTo({ top: 0 });
  };

  const openRoute = async (path: AdminRoutePath) => {
    await navigate({ to: path });
  };

  const authorizedRoutes = useMemo(
    () => getRoutableRouteMeta(dynamicMenus),
    [dynamicMenus],
  );

  const languageItems: MenuProps['items'] = [
    { key: 'zh', label: '简体中文' },
    { key: 'en', label: 'English（未接入）', disabled: true },
  ];

  const notificationItems = [
    {
      title: '布局已升级',
      description: '侧栏、顶部栏、标签页和内容滚动已切换到新的管理后台壳。',
    },
    {
      title: '待办提醒',
      description: '菜谱富文本、用户管理和 ProTable 迁移仍在后台体验升级中排队。',
    },
  ];
  const visibleNotificationItems = notificationsRead ? [] : notificationItems;

  const toggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      return;
    }

    await document.exitFullscreen();
  };

  return (
    <Header className={styles.bar}>
      <div className={styles.main}>
        <div className={styles.left}>
          {headerConfig.menuButton.enabled && showMenuButton ? (
            <Button
              type="text"
              icon={
                menuOpen ? (
                  <SvgIcon icon="ri:menu-fold-line" />
                ) : (
                  <SvgIcon icon="ri:menu-unfold-line" />
                )
              }
              onClick={toggleMenuOpen}
            />
          ) : null}
          {headerConfig.refreshButton.enabled && showRefreshButton ? (
            <Button type="text" className={styles.refreshButton} icon={<SvgIcon icon="ri:refresh-line" />} onClick={reload} />
          ) : null}
          {headerConfig.fastEnter.enabled && showFastEnter ? (
            <FastEnter routes={authorizedRoutes} onOpenRoute={openRoute} />
          ) : null}
          {headerConfig.breadcrumb.enabled && showCrumbs ? (
            <Breadcrumb menus={dynamicMenus} pathname={pathname} fallbackTitle={activeRoute.title} />
          ) : null}
        </div>

        <div className={styles.actions}>
          {headerConfig.globalSearch.enabled ? (
            <GlobalSearch routes={authorizedRoutes} onOpenRoute={openRoute} />
          ) : null}
          {headerConfig.fullscreen.enabled ? (
            <Tooltip title="全屏">
              <Button
                type="text"
                className={styles.fullScreenButton}
                icon={<SvgIcon icon="ri:fullscreen-line" />}
                onClick={() => void toggleFullScreen()}
              />
            </Tooltip>
          ) : null}
          {headerConfig.language.enabled && showLanguage ? (
            <Dropdown menu={{ items: languageItems }} trigger={['click']} placement="bottomRight">
              <Button type="text" className={styles.languageButton} icon={<SvgIcon icon="ri:translate-2" />} />
            </Dropdown>
          ) : null}
          {headerConfig.notification.enabled ? (
            <Popover
              open={notificationOpen}
              placement="bottomRight"
              title={
                <div className={styles.notificationTitle}>
                  <span>通知</span>
                  <Button
                    aria-label="关闭通知"
                    icon={<SvgIcon icon="ri:close-line" />}
                    size="small"
                    type="text"
                    onClick={() => setNotificationOpen(false)}
                  />
                </div>
              }
              content={
                <div className={styles.notificationPanel}>
                  {visibleNotificationItems.length > 0 ? (
                    <>
                      <List
                        className={styles.popoverList}
                        dataSource={visibleNotificationItems}
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta title={item.title} description={item.description} />
                          </List.Item>
                        )}
                      />
                      <Button
                        block
                        type="link"
                        onClick={() => {
                          setNotificationsRead(true);
                          setNotificationOpen(false);
                        }}
                      >
                        全部已读
                      </Button>
                    </>
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无通知" />
                  )}
                </div>
              }
              trigger="click"
              onOpenChange={setNotificationOpen}
            >
              <Button type="text" className={`${styles.noticeButton} relative`} icon={<SvgIcon icon="ri:notification-2-line" />}>
                {!notificationsRead && (
                  <span className="absolute top-2 right-2 size-1.5 bg-red-500 rounded-full" />
                )}
              </Button>
            </Popover>
          ) : null}
          {headerConfig.chat.enabled ? (
            <Popover
              placement="bottomRight"
              title="聊天入口"
              content={
                <Typography.Text type="secondary">
                  聊天功能已预留，后续接入家庭点菜实时沟通。
                </Typography.Text>
              }
              trigger="click"
            >
              <Button type="text" className={`${styles.chatButton} relative`} icon={<SvgIcon icon="ri:message-3-line" />}>
                <span className={`${styles.breathingDot} absolute top-2 right-2 size-1.5 bg-green-500 rounded-full`} />
              </Button>
            </Popover>
          ) : null}
          {headerConfig.settings.enabled ? (
            <Button
              type="text"
              className={styles.settingButton}
              icon={<SvgIcon icon="ri:settings-line" />}
              onClick={() => setSettingsOpen(true)}
            />
          ) : null}
          {headerConfig.themeToggle.enabled ? (
            <Tooltip title={systemThemeType === SystemThemeEnum.DARK ? '浅色模式' : '暗色模式'}>
              <Button
                type="text"
                icon={
                  systemThemeType === SystemThemeEnum.DARK ? (
                    <SvgIcon icon="ri:sun-line" />
                  ) : (
                    <SvgIcon icon="ri:moon-line" />
                  )
                }
                onClick={(event) => runThemeTransition(toggleTheme, event.nativeEvent)}
              />
            </Tooltip>
          ) : null}
          <UserMenu />
        </div>
      </div>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Header>
  );
}
