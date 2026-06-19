import { useNavigate } from '@tanstack/react-router';
import { Button, Form, Input, App as AntdApp } from 'antd';
import type { LoginInput } from '@feed-plan/shared';
import { AuthLayout } from '../../layouts/AuthLayout.js';
import { useAuthStore } from '../../features/auth/store.js';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { message } = AntdApp.useApp();

  const handleFinish = async (values: LoginInput) => {
    try {
      await login(values);
      await navigate({ to: '/', replace: true });
    } catch {
      message.error('用户名或密码错误');
    }
  };

  return (
    <AuthLayout>
      <Form layout="vertical" onFinish={handleFinish} autoComplete="off">
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input autoFocus />
        </Form.Item>
        <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          登录
        </Button>
      </Form>
    </AuthLayout>
  );
}
