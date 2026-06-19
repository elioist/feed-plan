import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { Button, Form, Input, Select, Space, Table, Tag } from 'antd';
import { PageScaffold } from '../../shared/components/PageScaffold.js';
import { mealQueries } from '../../features/meals/api.js';

export function MealListPage() {
  const search = useSearch({ from: '/_authenticated/meals' });
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(mealQueries.list(search));
  const [filterForm] = Form.useForm<typeof search>();

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
      <Table
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
              <Link to="/meals/$mealId" params={{ mealId: item.meal.id }}>
                查看
              </Link>
            ),
          },
        ]}
      />
    </PageScaffold>
  );
}
