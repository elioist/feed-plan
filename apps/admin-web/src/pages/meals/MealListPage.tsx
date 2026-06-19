import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { Button, Form, Input, Popconfirm, Select, Space, Tag, App as AntdApp } from 'antd';
import type { MenuDetail } from '@feed-plan/shared';
import { DataTable } from '~/shared/components/DataTable';
import { PageScaffold } from '~/shared/components/PageScaffold';
import { completeMeal, mealQueries } from '~/features/meals/api';

export function MealListPage() {
  const search = useSearch({ from: '/_authenticated/meals' });
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(mealQueries.list(search));
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const [filterForm] = Form.useForm<typeof search>();

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

  const updateSearch = async (values: typeof search) => {
    await navigate({ to: '/meals', search: values });
  };

  const resetSearch = async () => {
    filterForm.resetFields();
    await navigate({ to: '/meals', search: {} });
  };

  return (
    <PageScaffold
      title="点菜菜单"
      description="查看今日和历史点菜场次"
      breadcrumbItems={[{ title: '首页' }, { title: '点菜菜单' }]}
      tabs={[{ key: 'list', label: '菜单列表' }]}
      activeTabKey="list"
    >
      <Form
        key={JSON.stringify(search)}
        form={filterForm}
        className="toolbar"
        layout="inline"
        initialValues={search}
        onFinish={updateSearch}
      >
        <Form.Item name="mealDate">
          <Input placeholder="日期 YYYY-MM-DD" />
        </Form.Item>
        <Form.Item name="mealType">
          <Select
            placeholder="餐型"
            allowClear
            style={{ width: 140 }}
            options={[
              { label: '早餐', value: 'breakfast' },
              { label: '午餐', value: 'lunch' },
              { label: '晚餐', value: 'dinner' },
            ]}
          />
        </Form.Item>
        <Form.Item name="status">
          <Select
            placeholder="状态"
            allowClear
            style={{ width: 140 }}
            options={[
              { label: '点菜中', value: 'ordering' },
              { label: '已完成', value: 'completed' },
            ]}
          />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            查询
          </Button>
          <Button onClick={resetSearch}>重置</Button>
        </Space>
      </Form>
      <DataTable<MenuDetail>
        rowKey={({ meal }) => meal.id}
        dataSource={data}
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        columns={[
          { title: '标题', render: (_, item) => item.meal.title },
          { title: '日期', render: (_, item) => item.meal.mealDate },
          { title: '餐型', render: (_, item) => item.meal.mealType },
          {
            title: '状态',
            render: (_, item) =>
              item.meal.status === 'ordering' ? <Tag color="blue">点菜中</Tag> : <Tag>已完成</Tag>,
          },
          { title: '菜品数', render: (_, item) => item.items.length },
          {
            title: '操作',
            render: (_, item) => (
              <Space>
                <Link to="/meals/$mealId" params={{ mealId: item.meal.id }}>
                  查看
                </Link>
                {item.meal.status === 'ordering' ? (
                  <Popconfirm
                    title="完成点餐"
                    description="完成后本场点餐会锁定，确认继续？"
                    okText="完成"
                    cancelText="取消"
                    onConfirm={() => completeMutation.mutate(item.meal.id)}
                  >
                    <Button type="link" loading={completeMutation.isPending}>
                      完成
                    </Button>
                  </Popconfirm>
                ) : (
                  <Button type="link" disabled>
                    已完成
                  </Button>
                )}
              </Space>
            ),
          },
        ]}
      />
    </PageScaffold>
  );
}
