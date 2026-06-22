import { App as AntdApp, Avatar, Dropdown } from 'antd';
import type { Role } from '@feed-plan/shared';
import { SvgIcon } from '~/components/core/base/svg-icon/SvgIcon';
import { useAuthStore } from '~/store/modules/auth';

const roleLabels: Record<Role, string> = {
  chef: '主厨',
  diner: '食客',
};

interface UserMenuEntry {
  key: string;
  icon: string;
  label: string;
  disabled?: boolean;
}

const entries: UserMenuEntry[] = [
  { key: 'profile', icon: 'ri:user-3-line', label: '个人中心', disabled: true },
  { key: 'docs', icon: 'ri:book-2-line', label: '项目文档', disabled: true },
  { key: 'github', icon: 'ri:github-line', label: '源码仓库', disabled: true },
  { key: 'lock', icon: 'ri:lock-line', label: '锁定屏幕', disabled: true },
];

export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { message } = AntdApp.useApp();
  const username = user?.username ?? '未登录';
  const roleLabel = user ? roleLabels[user.role] : '';

  const panel = (
    <div className="user-menu-panel">
      <div className="user-menu-head">
        <Avatar size={40} icon={<SvgIcon icon="ri:user-3-line" />} />
        <div className="user-menu-head-info">
          <strong>{username}</strong>
          <span>{roleLabel}</span>
        </div>
      </div>
      <ul className="user-menu-list">
        {entries.map((entry) => (
          <li
            key={entry.key}
            className={entry.disabled ? 'user-menu-item is-disabled' : 'user-menu-item'}
            onClick={() => entry.disabled && message.info('功能开发中')}
          >
            <SvgIcon icon={entry.icon} />
            <span>{entry.label}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="user-menu-logout" onClick={logout}>
        <SvgIcon icon="ri:logout-box-r-line" />
        <span>退出登录</span>
      </button>
    </div>
  );

  return (
    <Dropdown
      placement="bottomRight"
      trigger={['hover']}
      popupRender={() => panel}
      classNames={{ root: 'user-menu-popover' }}
    >
      <button type="button" className="user-menu-trigger">
        <Avatar size={34} icon={<SvgIcon icon="ri:user-3-line" />} alt={username} />
        <span className="user-name">
          <span className="user-name-main">{username}</span>
          <span className="user-name-role">{roleLabel}</span>
        </span>
      </button>
    </Dropdown>
  );
}
