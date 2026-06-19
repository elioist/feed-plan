import { Breadcrumb, Card, Space, Tabs, Typography } from 'antd';
import type { BreadcrumbProps, TabsProps } from 'antd';
import type { ReactNode } from 'react';

interface PageScaffoldProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbItems?: BreadcrumbProps['items'];
  tabs?: TabsProps['items'];
  activeTabKey?: string;
  children: ReactNode;
}

export function PageScaffold({
  title,
  description,
  actions,
  breadcrumbItems,
  tabs,
  activeTabKey,
  children,
}: PageScaffoldProps) {
  return (
    <div className="page-scaffold">
      {breadcrumbItems ? <Breadcrumb className="page-breadcrumb" items={breadcrumbItems} /> : null}
      <Card className="page-card" variant="outlined">
        <div className="page-header">
          <div>
            <Typography.Title level={3}>{title}</Typography.Title>
            {description ? <Typography.Text type="secondary">{description}</Typography.Text> : null}
          </div>
          {actions ? <Space>{actions}</Space> : null}
        </div>
        {tabs ? <Tabs activeKey={activeTabKey} items={tabs} className="page-tabs" /> : null}
        {children}
      </Card>
    </div>
  );
}
