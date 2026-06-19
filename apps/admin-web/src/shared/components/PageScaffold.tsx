import type { BreadcrumbProps, TabsProps } from 'antd';
import { Typography } from 'antd';
import { PageContainer, ProCard } from '@ant-design/pro-components';
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
    <PageContainer
      className="page-scaffold"
      title={
        <Typography.Title className="page-title" level={3}>
          {title}
        </Typography.Title>
      }
      subTitle={description}
      extra={actions}
      breadcrumb={breadcrumbItems ? { items: breadcrumbItems } : undefined}
      tabList={tabs}
      tabActiveKey={activeTabKey}
    >
      <ProCard className="page-card" bordered>
        {children}
      </ProCard>
    </PageContainer>
  );
}
