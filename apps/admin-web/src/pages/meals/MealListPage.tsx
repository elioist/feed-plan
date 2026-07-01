import { useState } from 'react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button, Card, Form, Popconfirm, Space, Tag, App as AntdApp } from 'antd';
import dayjs from 'dayjs';
import type { MealQuery, MenuDetail } from '@feed-plan/shared';
import { DataTable, TableHeader } from '~/components/core/tables';
import { useCanButton } from '~/hooks/use-button-access';
import { mealQueries } from '~/queries/meals';
import { api } from '~/lib/api-client';
import { MealSearchBar, type MealSearchFormValues } from './components/MealSearchBar';
import { MealDetailDrawer } from './components/MealDetailDrawer';

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
  const search = useSearch({ strict: false });
  const navigate = useNavigate();
  const canButton = useCanButton();
  const canComplete = canButton('meals', 'complete');
  const { data, refetch } = useSuspenseQuery(mealQueries.list(search));
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const [filterForm] = Form.useForm<MealSearchFormValues>();
  const [selectedMeal, setSelectedMeal] = useState<MenuDetail | null>(null);

  const completeMutation = useMutation({
    mutationFn: api.meals.complete,
    onSuccess: async (_detail, mealId) => {
      setSelectedMeal((current) =>
        current?.meal.id === mealId
          ? { ...current, meal: { ...current.meal, status: 'completed', completedAt: new Date() } }
          : current,
      );
      await queryClient.invalidateQueries({ queryKey: ['meals'] });
      message.success('本次点餐已完成');
    },
    onError: () => {
      message.error('完成点餐失败，请稍后重试');
    },
  });

  const updateSearch = async (values: MealSearchFormValues) => {
    await navigate({ to: '/meals' as never, search: toUrlSearch(values) as never });
  };

  const resetSearch = async () => {
    filterForm.resetFields();
    await navigate({ to: '/meals' as never, search: {} as never });
  };

  return (
    <>
      <MealSearchBar
        form={filterForm}
        searchParams={toSearchFormValues(search)}
        onSearch={updateSearch}
        onReset={resetSearch}
      />

      <Card className="border border-(--card-border) bg-(--default-box-color) p-4 rounded-[calc(var(--custom-radius)/2+2px)]">
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
                  <Button type="link" onClick={() => setSelectedMeal(item)}>
                    查看
                  </Button>
                  {item.meal.status === 'ordering' && canComplete ? (
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
                  ) : item.meal.status === 'completed' ? (
                    <Button type="link" disabled>
                      已完成
                    </Button>
                  ) : null}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <MealDetailDrawer
        meal={selectedMeal}
        canComplete={canComplete}
        completeLoading={completeMutation.isPending}
        onClose={() => setSelectedMeal(null)}
        onComplete={(mealId) => completeMutation.mutate(mealId)}
      />
    </>
  );
}
