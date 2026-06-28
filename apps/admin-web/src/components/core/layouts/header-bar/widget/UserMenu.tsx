import { Avatar, Button, Dropdown, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { SvgIcon } from '~/components/core/base/svg-icon/SvgIcon';
import { api } from '~/lib/api-client';
import { useAuthStore } from '~/store/modules/auth';

export function UserMenu() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const username = user?.username ?? '未登录';
  const avatarUrl = api.getImageUrl(user?.avatar ?? null);

  const items: MenuProps['items'] = [
    {
      key: 'head',
      label: (
        <div className="user-menu-head">
          <Avatar size={40} src={avatarUrl} icon={!avatarUrl && <SvgIcon icon="ri:user-3-line" />} />
          <div className="user-menu-head-info">
            <Typography.Text strong>{username}</Typography.Text>
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'profile',
      icon: <SvgIcon icon="ri:user-3-line" />,
      label: '个人中心',
      onClick: () => navigate({ to: '/profile' as never }),
    },
    {
      key: 'docs',
      icon: <SvgIcon icon="ri:book-2-line" />,
      label: '项目文档',
      disabled: true,
    },
    {
      key: 'github',
      icon: <SvgIcon icon="ri:github-line" />,
      label: '源码仓库',
      disabled: true,
    },
    {
      key: 'lock',
      icon: <SvgIcon icon="ri:lock-line" />,
      label: '锁定屏幕',
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <SvgIcon icon="ri:logout-box-r-line" />,
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
      <Button type="text" className="user-menu-trigger" aria-label={username + ' 的用户菜单'}>
        <Avatar
          size={34}
          src={avatarUrl}
          icon={!avatarUrl && <SvgIcon icon="ri:user-3-line" />}
          alt={username}
        />
      </Button>
    </Dropdown>
  );
}
