import {
  BugOutlined,
  CodeOutlined,
  HomeOutlined,
  LockOutlined,
  ReloadOutlined,
  RollbackOutlined,
  SyncOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { Button, Collapse, Result, Space, Tag, Typography } from 'antd';
import { useAuthStore } from '~/store/modules/auth';
import { parseRouteError } from '../error-utils';
import styles from './styles.module.scss';

interface AdminRouteErrorProps {
  error: unknown;
  reset?: () => void;
}

function getFriendlyMessage(message: string, status?: number) {
  if (status === 401) return '登录状态已失效，请重新登录后继续操作。';
  if (status === 403) return '当前账号没有访问这个页面的权限。';
  if (status === 404) return '这个页面或数据不存在，可能已经被删除。';
  if (status && status >= 500) return '服务端暂时没有处理成功，请稍后重试。';
  if (/internal server error/i.test(message)) return '服务端暂时没有处理成功，请稍后重试。';
  if (/failed to fetch|network/i.test(message)) return '无法连接到服务，请检查后端服务或网络配置。';
  return message || '页面加载时遇到问题。';
}

export function AdminRouteError({ error, reset }: AdminRouteErrorProps) {
  const parsed = parseRouteError(error);
  const description = getFriendlyMessage(parsed.message, parsed.status);
  const isForbidden = parsed.status === 403;
  const trace = [parsed.name, parsed.status ? `HTTP ${parsed.status}` : null, parsed.reason, parsed.message]
    .filter(Boolean)
    .join(' · ');
  const details = parsed.detail || parsed.stack || trace;
  const shouldShowDetails = import.meta.env.DEV && details;

  if (isForbidden) {
    const handleRelogin = () => {
      useAuthStore.getState().clearSession();
      window.location.assign('/login');
    };

    return (
      <main className={styles.accessPage}>
        <section className={styles.accessPanel} aria-labelledby="route-access-title">
          <div className={styles.accessOrbit} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className={styles.accessCopy}>
            <Tag color="gold" variant="filled">
              403
            </Tag>
            <Result
              className={styles.accessResult}
              icon={
                <div className={styles.accessIcon}>
                  <LockOutlined />
                </div>
              }
              title={
                <h1 id="route-access-title" className={styles.accessTitle}>
                  访问受限
                </h1>
              }
              subTitle={<span className={styles.accessSubtitle}>{description}</span>}
              extra={
                <Space wrap size="middle">
                  <Button type="primary" icon={<HomeOutlined />} onClick={() => window.location.assign('/')}>
                    回到首页
                  </Button>
                  <Button icon={<RollbackOutlined />} onClick={() => window.history.back()}>
                    返回上一页
                  </Button>
                  <Button icon={<UserSwitchOutlined />} onClick={handleRelogin}>
                    切换账号
                  </Button>
                </Space>
              }
            />

            <div className={styles.accessNote}>
              <Typography.Text strong>需要系统管理权限</Typography.Text>
              <Typography.Text type="secondary">
                当前账号已登录，但没有访问该模块所需的权限点。请使用超级管理员账号，或在角色管理中为当前账号授权。
              </Typography.Text>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.errorPage}>
      <section className={styles.errorPanel} aria-labelledby="route-error-title">
        <div className={styles.errorRail} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className={styles.errorCopy}>
          <div className={styles.errorKicker}>
            <Tag color="volcano" variant="filled">
              系统工单
            </Tag>
            <Typography.Text type="secondary">异常已拦截，页面没有继续渲染</Typography.Text>
          </div>

          <Result
            className={styles.errorResult}
            icon={
              <div className={styles.errorIcon}>
                <BugOutlined />
              </div>
            }
            title={
              <h1 id="route-error-title" className={styles.errorTitle}>
                页面暂时不可用
              </h1>
            }
            subTitle={<span className={styles.errorSubtitle}>{description}</span>}
            extra={
              <Space wrap size="middle">
                <Button type="primary" icon={<SyncOutlined />} onClick={() => reset?.()}>
                  重试
                </Button>
                <Button icon={<HomeOutlined />} onClick={() => window.location.assign('/')}>
                  回到首页
                </Button>
                <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
                  刷新页面
                </Button>
              </Space>
            }
          />

          {shouldShowDetails ? (
            <Collapse
              className={styles.errorDetail}
              ghost
              items={[
                {
                  key: 'detail',
                  label: (
                    <Space size={8}>
                      <CodeOutlined />
                      <span>错误详情</span>
                    </Space>
                  ),
                  children: <pre>{details}</pre>,
                },
              ]}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}
