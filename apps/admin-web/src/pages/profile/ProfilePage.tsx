import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { App as AntdApp, Avatar, Button, Card, Form, Input, Space, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import type { ChangePasswordInput, UpdateUserInput } from '@feed-plan/shared';
import { AvatarUpload } from '~/pages/users/components/AvatarUpload';
import { api } from '~/lib/api-client';
import { getApiErrorMessage } from '~/lib/error-parser';
import { useAuthStore } from '~/store/modules/auth';
import styles from './styles.module.scss';

interface PasswordFormValues extends ChangePasswordInput {
  confirmPassword: string;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const { message } = AntdApp.useApp();
  const [profileForm] = Form.useForm<UpdateUserInput>();
  const [passwordForm] = Form.useForm<PasswordFormValues>();
  const avatarUrl = api.getImageUrl(user?.avatar ?? null);

  useEffect(() => {
    profileForm.setFieldsValue({
      avatar: user?.avatar ?? null,
      username: user?.username ?? '',
    });
  }, [profileForm, user?.avatar, user?.username]);

  const profileMutation = useMutation({
    mutationFn: api.auth.updateProfile,
    onSuccess: (nextUser) => {
      setUser(nextUser);
      message.success('个人资料已更新');
    },
    onError: (error) => {
      message.error(getApiErrorMessage(error));
    },
  });

  const passwordMutation = useMutation({
    mutationFn: api.auth.changePassword,
    onSuccess: () => {
      passwordForm.resetFields();
      message.success('密码已修改，请重新登录');
      window.setTimeout(() => {
        clearSession();
        void navigate({ to: '/login', search: { redirect: undefined }, replace: true });
      }, 800);
    },
    onError: (error) => {
      message.error(getApiErrorMessage(error));
    },
  });

  const submitProfile = async () => {
    profileMutation.mutate(await profileForm.validateFields());
  };

  const submitPassword = async () => {
    const values = await passwordForm.validateFields();
    passwordMutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  return (
    <Card className="min-h-[calc(100vh-184px)] border border-(--card-border) bg-(--default-box-color) p-4 rounded-[calc(var(--custom-radius)/2+2px)]" title="个人中心">
      <div className={styles.page}>
        <aside className={styles.summary}>
          <Avatar
            size={88}
            src={avatarUrl}
            icon={!avatarUrl && <UserOutlined />}
            className={styles.avatar}
          >
            {user?.username?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div className={styles.summaryMain}>
            <Typography.Title level={4}>{user?.username ?? '未登录'}</Typography.Title>
            <Typography.Text type="secondary">
              {user?.roles.map((role) => role.name).join(' / ') || '暂无角色'}
            </Typography.Text>
          </div>
        </aside>

        <div className={styles.content}>
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <Typography.Title level={5}>基础资料</Typography.Title>
              <Typography.Text type="secondary">更新头像和后台显示名称</Typography.Text>
            </div>
            <Form form={profileForm} layout="vertical">
              <Form.Item label="头像" name="avatar">
                <AvatarUpload username={user?.username} />
              </Form.Item>
              <Form.Item
                label="用户名"
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { max: 64, message: '用户名最多 64 个字符' },
                ]}
              >
                <Input maxLength={64} allowClear />
              </Form.Item>
              <Button type="primary" loading={profileMutation.isPending} onClick={submitProfile}>
                保存资料
              </Button>
            </Form>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <Typography.Title level={5}>账号安全</Typography.Title>
              <Typography.Text type="secondary">修改密码后需要重新登录</Typography.Text>
            </div>
            <Form form={passwordForm} layout="vertical">
              <Form.Item
                label="当前密码"
                name="currentPassword"
                rules={[{ required: true, message: '请输入当前密码' }]}
              >
                <Input.Password maxLength={128} autoComplete="current-password" />
              </Form.Item>
              <Form.Item
                label="新密码"
                name="newPassword"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码至少 6 位' },
                ]}
              >
                <Input.Password maxLength={128} autoComplete="new-password" />
              </Form.Item>
              <Form.Item
                label="确认新密码"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请再次输入新密码' },
                  ({ getFieldValue }) => ({
                    validator(_rule: unknown, value: string | undefined) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的新密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password maxLength={128} autoComplete="new-password" />
              </Form.Item>
              <Space>
                <Button
                  type="primary"
                  danger
                  loading={passwordMutation.isPending}
                  onClick={submitPassword}
                >
                  修改密码
                </Button>
                <Button onClick={() => passwordForm.resetFields()}>重置</Button>
              </Space>
            </Form>
          </section>
        </div>
      </div>
    </Card>
  );
}
