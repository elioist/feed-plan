import { Card, Typography } from 'antd';
import type { PropsWithChildren } from 'react';
import './styles.css';

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main className="auth-layout">
      <Card className="auth-card">
        <Typography.Title level={3}>Feed Plan</Typography.Title>
        {children}
      </Card>
    </main>
  );
}
