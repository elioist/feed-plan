import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { Button, Card, Form, Popconfirm, Space, Tag, App as AntdApp } from 'antd';
import dayjs from 'dayjs';
import type { MealQuery, MenuDetail } from '@feed-plan/shared';
import { DataTable, TableHeader } from '~/components/core/tables';
import { completeMeal } from '~/api/meals';
import { mealQueries } from '~/queries/meals';
import { MealSearchBar, type MealSearchFormValues } from './components/MealSearchBar';

const toSearchFormValues = (search: MealQuery): MealSearchFormValues => {
  const from = search.mealDateFrom ?? search.mealDate;
  const to = search.mealDateTo ?? search.mealDate;

  return {
    mealDateRange: from && to ? [dayjs(from), dayjs(to)] : undefined,
    mealType: search.mealType,
    status: search.status,
  };
};

const formatDateValue = (value: { format: (template: string) => string }) =>
  value.format('YYYY-MM-DD');

const toUrlSearch = (values: MealSearchFormValues): MealQuery => {
  const next: MealQuery = {};
  const [from, to] = values.mealDateRange ?? [];

  if (from) {
    next.mealDateFrom = formatDateValue(from);
  }
  if (to) {
    next.mealDateTo = formatDateValue(to);
  }
  if (values.mealType) {
    next.mealType = values.mealType;
  }
  if (values.status) {
    next.status = values.status;
  }

  return next;
};

export function MealListPage() {
  const search = useSearch({ from: '/_authenticated/meals' });
  const navigate = useNavigate();
  const { data, refetch } = useSuspenseQuery(mealQueries.list(search));
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const [filterForm] = Form.useForm<MealSearchFormValues>();

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

  const updateSearch = async (values: MealSearchFormValues) => {
    await navigate({ to: '/meals', search: toUrlSearch(values) });
  };

  const resetSearch = async () => {
    filterForm.resetFields();
    await navigate({ to: '/meals', search: {} });
  };

  return (
    <>
      <MealSearchBar
        form={filterForm}
        searchParams={toSearchFormValues(search)}
        onSearch={updateSearch}
        onReset={resetSearch}
      />

      <Card className="art-table-card">
        <TableHeader loading={completeMutation.isPending} onRefresh={() => refetch()} />
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
      </Card>
    </>
  );
}
