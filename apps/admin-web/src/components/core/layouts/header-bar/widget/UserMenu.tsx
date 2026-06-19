import {
  BookOutlined,
  GithubOutlined,
  LockOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { useAuthStore } from '~/store/modules/auth';

export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const username = user?.username ?? '未登录';

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      disabled: true,
    },
    {
      key: 'docs',
      icon: <BookOutlined />,
      label: '项目文档',
      disabled: true,
    },
    {
      key: 'github',
      icon: <GithubOutlined />,
      label: '源码仓库',
      disabled: true,
    },
    {
      key: 'lock',
      icon: <LockOutlined />,
      label: '锁定屏幕',
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <Dropdown
      menu={{ items }}
      placement="bottomRight"
      trigger={['hover']}
      classNames={{ root: 'user-menu-popover' }}
    >
      <Button className="user-menu-trigger" type="text">
        <Space size={9}>
          <Avatar size={34} icon={<UserOutlined />} alt={username} />
          <span className="user-name">
            <Typography.Text>{username}</Typography.Text>
            <Typography.Text type="secondary">chef</Typography.Text>
          </span>
        </Space>
      </Button>
    </Dropdown>
  );
}
