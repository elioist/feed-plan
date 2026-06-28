import { Button, Popover, Typography } from 'antd';
import { SvgIcon } from '~/components/core/base/svg-icon';
import type { AdminRoutePath, ResolvedRouteMeta } from '~/routes/core/menu-processor';
import styles from './styles.module.scss';

interface FastEnterProps {
  routes: ResolvedRouteMeta[];
  onOpenRoute: (path: AdminRoutePath) => void | Promise<void>;
}

export function FastEnter({ routes, onOpenRoute }: FastEnterProps) {
  const quickApplications = routes.map((route) => ({
    ...route,
    description: route.path === '/' ? '查看后台概览' : route.path,
  }));
  const quickLinks = routes.slice(0, 3).map((route) => ({ name: route.title, path: route.path }));

  return (
    <Popover
      placement="bottomLeft"
      trigger="hover"
      arrow={false}
      classNames={{ root: styles.popover }}
      content={
        <div className={styles.panel}>
          <div className={styles.apps}>
            {quickApplications.map((application) => (
              <button
                key={application.path}
                className={styles.app}
                type="button"
                onClick={() => void onOpenRoute(application.path)}
              >
                <span className={styles.icon}>{application.icon}</span>
                <span>
                  <strong>{application.title}</strong>
                  <small>{application.description}</small>
                </span>
              </button>
            ))}
          </div>
          <div className={styles.links}>
            <Typography.Title level={5}>快速链接</Typography.Title>
            {quickLinks.map((link) => (
              <button
                key={link.name}
                className={styles.link}
                type="button"
                onClick={() => void onOpenRoute(link.path)}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      }
    >
      <Button type="text" icon={<SvgIcon icon="ri:function-line" />} />
    </Popover>
  );
}
