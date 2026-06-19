import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { Button, Card, Descriptions, Table, Tag, App as AntdApp } from 'antd';
import { PageHeader } from '../../shared/components/PageHeader.js';
import { completeMeal, mealQueries } from '../../features/meals/api.js';

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
  });

  return (
    <>
      <PageHeader
        title="菜单详情"
        actions={
          <Button
            type="primary"
            disabled={data.meal.status === 'completed'}
            loading={completeMutation.isPending}
            onClick={() => completeMutation.mutate(data.meal.id)}
          >
            完成本次点餐
          </Button>
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
