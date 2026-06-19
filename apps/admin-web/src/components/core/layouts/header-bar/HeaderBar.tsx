import {
  AppstoreOutlined,
  BellOutlined,
  CloseOutlined,
  FullscreenOutlined,
  MessageOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  SunOutlined,
  TranslationOutlined,
} from '@ant-design/icons';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import {
  Badge,
  Button,
  Dropdown,
  Empty,
  Input,
  Layout,
  List,
  Modal,
  Popover,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { MenuProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { AppConfig } from '~/config';
import { SystemThemeEnum } from '~/enums/appEnum';
import { useSettingStore } from '~/store/modules/setting';
import { SettingsPanel } from '~/components/core/layouts/settings-panel/SettingsPanel';
import {
  adminRoutes,
  getRouteMeta,
  type AdminRoutePath,
} from '~/components/core/layouts/navigation';
import { UserMenu } from '~/components/core/layouts/header-bar/widget/UserMenu';

const { Header } = Layout;

export function HeaderBar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const activeRoute = getRouteMeta(pathname);
  const menuOpen = useSettingStore((state) => state.menuOpen);
  const toggleMenuOpen = useSettingStore((state) => state.toggleMenuOpen);
  const reloadPage = useSettingStore((state) => state.reload);
  const systemThemeType = useSettingStore((state) => state.systemThemeType);
  const toggleTheme = useSettingStore((state) => state.toggleTheme);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);

  const headerConfig = AppConfig.headerBar;

  const reload = () => {
    reloadPage();
    document.getElementById('app-main')?.scrollTo({ top: 0 });
  };

  const openRoute = async (path: AdminRoutePath) => {
    setSearchOpen(false);
    setSearchKeyword('');
    await navigate({ to: path });
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchKeyword('');
  };

  const filteredRoutes = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      return adminRoutes;
    }

    return adminRoutes.filter((route) => {
      return (
        route.title.toLowerCase().includes(keyword) ||
        route.group.toLowerCase().includes(keyword) ||
        route.path.toLowerCase().includes(keyword)
      );
    });
  }, [searchKeyword]);

  const quickApplications = adminRoutes.map((route) => ({
    ...route,
    description: route.path === '/' ? '查看后台概览' : '进入' + route.group,
  }));

  const quickLinks = [
    { name: '新建菜谱', path: '/dishes' as const },
    { name: '分类管理', path: '/categories' as const },
    { name: '今日菜单', path: '/meals' as const },
  ];

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
      description: '菜谱富文本、用户管理和 ProTable 迁移仍在 admin-web change 中排队。',
    },
  ];
  const visibleNotificationItems = notificationsRead ? [] : notificationItems;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      return;
    }

    await document.exitFullscreen();
  };

  return (
    <Header className="header-bar">
      <div className="header-main">
        <div className="header-left">
          {headerConfig.menuButton.enabled ? (
            <Button
              type="text"
              icon={menuOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
              onClick={toggleMenuOpen}
            />
          ) : null}
          {headerConfig.refreshButton.enabled ? (
            <Button type="text" icon={<ReloadOutlined />} onClick={reload} />
          ) : null}
          {headerConfig.fastEnter.enabled ? (
            <Popover
              placement="bottomLeft"
              trigger="hover"
              arrow={false}
              classNames={{ root: 'fast-entry-popover' }}
              content={
                <div className="fast-entry-panel">
                  <div className="fast-entry-apps">
                    {quickApplications.map((application) => (
                      <button
                        key={application.path}
                        className="fast-entry-app"
                        type="button"
                        onClick={() => void openRoute(application.path)}
                      >
                        <span className="fast-entry-icon">{application.icon}</span>
                        <span>
                          <strong>{application.title}</strong>
                          <small>{application.description}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="fast-entry-links">
                    <Typography.Title level={5}>快速链接</Typography.Title>
                    {quickLinks.map((link) => (
                      <button
                        key={link.name}
                        className="fast-entry-link"
                        type="button"
                        onClick={() => void openRoute(link.path)}
                      >
                        {link.name}
                      </button>
                    ))}
                  </div>
                </div>
              }
            >
              <Button type="text" icon={<AppstoreOutlined />} />
            </Popover>
          ) : null}
          {headerConfig.breadcrumb.enabled ? (
            <Typography.Text className="admin-breadcrumb">
              {activeRoute.group} <span>/</span> {activeRoute.title}
            </Typography.Text>
          ) : null}
        </div>

        <div className="header-actions">
          {headerConfig.globalSearch.enabled ? (
            <Input
              className="admin-search"
              prefix={<SearchOutlined />}
              placeholder="搜索"
              suffix={<span className="admin-search-kbd">⌘ K</span>}
              readOnly
              onClick={() => setSearchOpen(true)}
            />
          ) : null}
          {headerConfig.fullscreen.enabled ? (
            <Tooltip title="全屏">
              <Button
                type="text"
                icon={<FullscreenOutlined />}
                onClick={() => void toggleFullScreen()}
              />
            </Tooltip>
          ) : null}
          {headerConfig.language.enabled ? (
            <Dropdown menu={{ items: languageItems }} trigger={['click']} placement="bottomRight">
              <Button type="text" icon={<TranslationOutlined />} />
            </Dropdown>
          ) : null}
          {headerConfig.notification.enabled ? (
            <Popover
              open={notificationOpen}
              placement="bottomRight"
              title={
                <div className="notification-title">
                  <span>通知</span>
                  <Button
                    aria-label="关闭通知"
                    icon={<CloseOutlined />}
                    size="small"
                    type="text"
                    onClick={() => setNotificationOpen(false)}
                  />
                </div>
              }
              content={
                <div className="notification-panel">
                  {visibleNotificationItems.length > 0 ? (
                    <>
                      <List
                        className="header-popover-list"
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
              <Badge dot={!notificationsRead}>
                <Button type="text" icon={<BellOutlined />} />
              </Badge>
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
              <Badge dot color="green">
                <Button type="text" icon={<MessageOutlined />} />
              </Badge>
            </Popover>
          ) : null}
          {headerConfig.settings.enabled ? (
            <Badge dot color="green">
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={() => setSettingsOpen(true)}
              />
            </Badge>
          ) : null}
          {headerConfig.themeToggle.enabled ? (
            <Tooltip title={systemThemeType === SystemThemeEnum.DARK ? '浅色模式' : '暗色模式'}>
              <Button
                type="text"
                icon={systemThemeType === SystemThemeEnum.DARK ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleTheme}
              />
            </Tooltip>
          ) : null}
          <Space size={0}>
            <UserMenu />
          </Space>
        </div>
      </div>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Modal
        title="全局搜索"
        open={searchOpen}
        width={560}
        footer={null}
        destroyOnHidden
        focusable={{ focusTriggerAfterClose: false }}
        onCancel={closeSearch}
      >
        <Input
          autoFocus
          prefix={<SearchOutlined />}
          placeholder="搜索页面或功能"
          value={searchKeyword}
          onChange={(event) => setSearchKeyword(event.target.value)}
        />
        {filteredRoutes.length > 0 ? (
          <List
            className="command-list"
            dataSource={filteredRoutes}
            renderItem={(route) => (
              <List.Item
                actions={[<Tag key="group">{route.group}</Tag>]}
                className="command-list-item"
                onClick={() => void openRoute(route.path)}
              >
                <List.Item.Meta avatar={route.icon} title={route.title} description={route.path} />
              </List.Item>
            )}
          />
        ) : (
          <Empty className="command-empty" description="没有匹配的页面" />
        )}
      </Modal>
    </Header>
  );
}
