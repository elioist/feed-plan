import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { Button, Card, Descriptions, Popconfirm, Table, Tag, App as AntdApp } from 'antd';
import { PageHeader } from '~/shared/components/PageHeader';
import { completeMeal, mealQueries } from '~/features/meals/api';

export function MealDetailPage() {
  const { mealId } = useParams({ from: '/_authenticated/meals/$mealId' });
  const { data } = useSuspenseQuery(mealQueries.detail(mealId));
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();

  const completeMutation = useMutation({
    mutationFn: completeMeal,
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
      <PageHeader
        title="菜单详情"
        actions={
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
        }
      />
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
