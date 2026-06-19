import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  Button,
  Drawer,
  Form,
  Image,
  Input,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  App as AntdApp,
} from 'antd';
import { useState } from 'react';
import type { CreateDishInput, DishDifficulty } from '@feed-plan/shared';
import { PageScaffold } from '../../shared/components/PageScaffold.js';
import { categoryQueries } from '../../features/categories/api.js';
import { createDish, dishQueries, setDishActive, updateDish } from '../../features/dishes/api.js';
import { DishForm } from '../../features/dishes/components/DishForm.js';

const difficultyLabels: Record<DishDifficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

type DrawerMode = 'create' | 'edit';

export function DishListPage() {
  const search = useSearch({ from: '/_authenticated/dishes' });
  const navigate = useNavigate();
  const { data: dishes } = useSuspenseQuery(dishQueries.list(search));
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dishes'] });
      message.success('菜谱状态已更新');
    },
  });

  const updateSearch = async (values: typeof search) => {
    await navigate({
      to: '/dishes',
      search: values,
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

  return (
    <>
      <PageScaffold
        title="菜谱管理"
        breadcrumbItems={[{ title: '首页' }, { title: '菜谱管理' }]}
        tabs={[{ key: 'list', label: '菜谱列表' }]}
        activeTabKey="list"
        actions={
          <Button type="primary" onClick={openCreateDrawer}>
            新建菜谱
          </Button>
        }
      >
        <Form
          key={JSON.stringify(search)}
          form={filterForm}
          className="toolbar"
          layout="inline"
          initialValues={search}
          onFinish={updateSearch}
        >
          <Form.Item name="keyword">
            <Input.Search placeholder="搜索菜名、描述或菜谱内容" allowClear />
          </Form.Item>
          <Form.Item name="categoryId">
            <Select
              placeholder="分类"
              allowClear
              style={{ width: 180 }}
              options={categories.map((category) => ({ label: category.name, value: category.id }))}
            />
          </Form.Item>
          <Form.Item name="isActive">
            <Select
              placeholder="状态"
              allowClear
              style={{ width: 140 }}
              options={[
                { label: '启用', value: true },
                { label: '停用', value: false },
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
              render: (difficulty: DishDifficulty) => difficultyLabels[difficulty],
            },
            {
              title: '状态',
              width: 120,
              render: (_, dish) =>
                dish.isActive ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>,
            },
            {
              title: '操作',
              width: 220,
              render: (_, dish) => (
                <Space>
                  <Button type="link" onClick={() => openEditDrawer(dish.id)}>
                    编辑
                  </Button>
                  <Switch
                    checked={dish.isActive}
                    checkedChildren="启用"
                    unCheckedChildren="停用"
                    onChange={(isActive) => activeMutation.mutate({ id: dish.id, isActive })}
                  />
                </Space>
              ),
            },
          ]}
        />
      </PageScaffold>
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
