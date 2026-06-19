import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  Button,
  Card,
  Drawer,
  Form,
  Image,
  Popconfirm,
  Space,
  Switch,
  Tag,
  App as AntdApp,
} from 'antd';
import { useState } from 'react';
import type {
  CreateDishInput,
  DishDifficulty,
  DishListQuery,
  DishSummary,
} from '@feed-plan/shared';
import { DataTable, TableHeader } from '~/components/core/tables';
import { createDish, deleteDish, setDishActive, updateDish } from '~/api/dishes';
import { categoryQueries } from '~/queries/categories';
import { dishQueries } from '~/queries/dishes';
import { DishForm } from './components/DishForm';
import { DishSearchBar } from './components/DishSearchBar';

const difficultyLabels: Record<DishDifficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

type DrawerMode = 'create' | 'edit';

const toUrlSearch = (values: DishListQuery): DishListQuery => {
  const next = { ...values };

  if (next.isActive === true) {
    delete next.isActive;
  }

  return next;
};

export function DishListPage() {
  const search = useSearch({ from: '/_authenticated/dishes' });
  const navigate = useNavigate();
  const listSearch = { ...search, isActive: search.isActive ?? true };
  const { data: dishes, refetch } = useSuspenseQuery(dishQueries.list(listSearch));
  const { data: categories } = useSuspenseQuery(categoryQueries.all());
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const [filterForm] = Form.useForm<typeof search>();
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('create');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);

  const editingDishQuery = useQuery({
    ...dishQueries.detail(editingDishId ?? ''),
    enabled: drawerMode === 'edit' && Boolean(editingDishId),
  });

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingDishId(null);
    setDrawerMode('create');
  };

  const openCreateDrawer = () => {
    setDrawerMode('create');
    setEditingDishId(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (dishId: string) => {
    setDrawerMode('edit');
    setEditingDishId(dishId);
    setDrawerOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: createDish,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dishes'] });
      message.success('菜谱已创建');
      closeDrawer();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: CreateDishInput) => updateDish(editingDishId ?? '', input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dishes'] });
      message.success('菜谱已更新');
      closeDrawer();
    },
  });

  const activeMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setDishActive(id, { isActive }),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['dishes'] });
      message.success(variables.isActive ? '菜谱已启用' : '菜谱状态已更新');
    },
    onError: () => {
      message.error('菜谱状态更新失败，请稍后重试');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDish,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dishes'] });
      message.success('菜谱已删除');
    },
    onError: () => {
      message.error('删除失败，若菜谱已被点餐引用，请改为停用');
    },
  });

  const updateSearch = async (values: typeof search) => {
    await navigate({
      to: '/dishes',
      search: toUrlSearch(values),
    });
  };

  const resetSearch = async () => {
    filterForm.resetFields();
    await navigate({ to: '/dishes', search: {} });
  };

  const submitDish = (input: CreateDishInput) => {
    if (drawerMode === 'edit') {
      updateMutation.mutate(input);
      return;
    }
    createMutation.mutate(input);
  };

  const drawerLoading = createMutation.isPending || updateMutation.isPending;
  const editingDish = drawerMode === 'edit' ? editingDishQuery.data : undefined;
  const isLoading =
    createMutation.isPending || updateMutation.isPending || editingDishQuery.isFetching;

  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category.id,
  }));

  return (
    <>
      <DishSearchBar
        form={filterForm}
        searchParams={listSearch}
        onSearch={updateSearch}
        onReset={resetSearch}
        categoryOptions={categoryOptions}
      />

      <Card className="art-table-card">
        <TableHeader
          left={
            <Button type="primary" onClick={openCreateDrawer}>
              新建菜谱
            </Button>
          }
          loading={isLoading}
          onRefresh={() => refetch()}
        />
        <DataTable<DishSummary>
          rowKey="id"
          dataSource={dishes}
          pagination={{
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          columns={[
            {
              title: '封面',
              width: 96,
              render: (_, dish) =>
                dish.coverImage ? (
                  <Image width={56} height={42} src={dish.coverImage} alt={dish.name} />
                ) : (
                  '-'
                ),
            },
            { title: '菜名', dataIndex: 'name' },
            {
              title: '分类',
              render: (_, dish) => dish.category?.name ?? '-',
            },
            {
              title: '难度',
              dataIndex: 'difficulty',
              width: 120,
              render: (_, dish) => difficultyLabels[dish.difficulty],
            },
            {
              title: '标签',
              width: 200,
              render: (_, dish) =>
                dish.tags.length || dish.dietary.length ? (
                  <Space size={[0, 4]} wrap>
                    {dish.tags.map((tag) => (
                      <Tag key={`tag-${tag}`} color="blue">
                        {tag}
                      </Tag>
                    ))}
                    {dish.dietary.map((item) => (
                      <Tag key={`diet-${item}`} color="orange">
                        忌{item}
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  '-'
                ),
            },
            {
              title: '状态',
              width: 140,
              render: (_, dish) =>
                dish.isActive ? (
                  <Popconfirm
                    title="停用菜谱"
                    description="停用后食客将无法继续看到这道菜，确认继续？"
                    okText="停用"
                    okButtonProps={{ danger: true }}
                    cancelText="取消"
                    onConfirm={() => activeMutation.mutate({ id: dish.id, isActive: false })}
                  >
                    <Switch
                      checked
                      checkedChildren="启用"
                      loading={activeMutation.isPending}
                      unCheckedChildren="停用"
                    />
                  </Popconfirm>
                ) : (
                  <Switch
                    checked={false}
                    checkedChildren="启用"
                    loading={activeMutation.isPending}
                    unCheckedChildren="停用"
                    onChange={(checked) =>
                      activeMutation.mutate({ id: dish.id, isActive: checked })
                    }
                  />
                ),
            },
            {
              title: '操作',
              width: 180,
              render: (_, dish) => (
                <Space>
                  <Button type="link" onClick={() => openEditDrawer(dish.id)}>
                    编辑
                  </Button>
                  <Popconfirm
                    title="删除菜谱"
                    description="删除后不可恢复，确认继续？"
                    okText="删除"
                    cancelText="取消"
                    onConfirm={() => deleteMutation.mutate(dish.id)}
                  >
                    <Button type="link" danger loading={deleteMutation.isPending}>
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Drawer
        title={drawerMode === 'edit' ? '编辑菜谱' : '新建菜谱'}
        open={drawerOpen}
        onClose={closeDrawer}
        size={720}
        destroyOnHidden
      >
        {drawerMode === 'create' || editingDish ? (
          <DishForm
            key={drawerMode === 'edit' ? editingDish?.id : 'create'}
            categories={categories}
            initialValue={editingDish}
            loading={drawerLoading || editingDishQuery.isFetching}
            onSubmit={submitDish}
          />
        ) : null}
      </Drawer>
    </>
  );
}
