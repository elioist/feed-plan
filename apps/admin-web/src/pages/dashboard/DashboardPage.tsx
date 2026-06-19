import { Card, Col, Row, Statistic, Typography } from 'antd';

const { Title } = Typography;

export function DashboardPage() {
  return (
    <>
      <Title level={3}>主厨工作台</Title>
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