import { Card, Col, Row, Statistic } from 'antd';
import { PageHeader } from '../../shared/components/PageHeader.js';

export function DashboardPage() {
  return (
    <>
      <PageHeader title="首页" description="主厨工作台" />
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="今日菜单" value="待接入" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="菜谱管理" value="可用" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="分类管理" value="可用" />
          </Card>
        </Col>
      </Row>
    </>
  );
}
