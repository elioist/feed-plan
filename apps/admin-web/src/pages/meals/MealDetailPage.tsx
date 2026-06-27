import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { Button, Card, Descriptions, Popconfirm, Space, Table, Tag, Typography, App as AntdApp } from 'antd';
import { useCanButton } from '~/hooks/use-button-access';
import { mealQueries } from '~/queries/meals';
import { api } from '~/lib/api-client';

const { Title } = Typography;

export function MealDetailPage() {
  const { mealId } = useParams({ from: '/_authenticated/meals/$mealId' });
  const canButton = useCanButton();
  const canComplete = canButton('meals', 'complete');
  const { data } = useSuspenseQuery(mealQueries.detail(mealId));
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();

  const completeMutation = useMutation({
    mutationFn: api.meals.complete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['meals'] });
      message.success('本次点餐已完成');
    },
    onError: () => {
      message.error('完成点餐失败，请稍后重试');
    },
  });

  return (
    <>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          菜单详情
        </Title>
        {canComplete ? (
          <Popconfirm
            title="完成点餐"
            description="完成后本场点餐会锁定，确认继续？"
            disabled={data.meal.status === 'completed'}
            okText="完成"
            cancelText="取消"
            onConfirm={() => completeMutation.mutate(data.meal.id)}
          >
            <Button
              type="primary"
              disabled={data.meal.status === 'completed'}
              loading={completeMutation.isPending}
            >
              完成本次点餐
            </Button>
          </Popconfirm>
        ) : null}
      </Space>
      <Card>
        <Descriptions column={3}>
          <Descriptions.Item label="标题">{data.meal.title}</Descriptions.Item>
          <Descriptions.Item label="日期">{data.meal.mealDate}</Descriptions.Item>
          <Descriptions.Item label="餐型">{data.meal.mealType}</Descriptions.Item>
          <Descriptions.Item label="状态">
            {data.meal.status === 'ordering' ? <Tag color="blue">点菜中</Tag> : <Tag>已完成</Tag>}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Table
        rowKey={(item) => item.dish.id}
        dataSource={data.items}
        columns={[
          { title: '菜品', render: (_, item) => item.dish.name },
          { title: '总份数', dataIndex: 'totalQuantity' },
          {
            title: '点单人',
            render: (_, item) =>
              item.quantities.map((q) => q.username ?? q.guestName ?? '未知').join('、'),
          },
        ]}
      />
    </>
  );
}
