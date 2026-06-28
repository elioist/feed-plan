import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { App as AntdApp, Button, Card, Drawer, Form, Input, InputNumber, Popconfirm, Space } from 'antd';
import { useState } from 'react';
import type { Category, CategoryListQuery, CreateCategoryInput } from '@feed-plan/shared';
import { SearchBar, type SearchFormItem } from '~/components/core/search';
import { DataTable, TableHeader } from '~/components/core/tables';
import { useCanButton } from '~/hooks/use-button-access';
import { api } from '~/lib/api-client';
import { getApiErrorMessage } from '~/lib/error-parser';
import { categoryQueries } from '~/queries/categories';

type CategoryFormValues = CreateCategoryInput;

export function CategoryListPage() {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();
  const canButton = useCanButton();
  const canCreate = canButton('recipes.categories', 'create');
  const canEdit = canButton('recipes.categories', 'edit');
  const canDelete = canButton('recipes.categories', 'delete');
  const { data: categories, refetch } = useSuspenseQuery(categoryQueries.all(search));
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const [searchForm] = Form.useForm<CategoryListQuery>();
  const [form] = Form.useForm<CategoryFormValues>();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const invalidateCategories = async () => {
    await queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const saveMutation = useMutation({
    mutationFn: (input: CategoryFormValues) =>
      editingCategory ? api.categories.update(editingCategory.id, input) : api.categories.create(input),
    onSuccess: async () => {
      await invalidateCategories();
      message.success(editingCategory ? '分类已更新' : '分类已创建');
      closeDrawer();
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: api.categories.delete,
    onSuccess: async () => {
      await invalidateCategories();
      message.success('分类已删除');
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const updateSearch = async (values: CategoryListQuery) => {
    await navigate({ to: '/categories' as never, search: values as never });
  };

  const resetSearch = async () => {
    searchForm.resetFields();
    await navigate({ to: '/categories' as never, search: {} as never });
  };

  const openDrawer = (category?: Category) => {
    setEditingCategory(category ?? null);
    setDrawerOpen(true);
    form.setFieldsValue(
      category ? { name: category.name, sortOrder: category.sortOrder } : { name: '', sortOrder: 0 },
    );
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const saveCategory = async () => {
    saveMutation.mutate(await form.validateFields());
  };

  const searchItems: SearchFormItem[] = [
    {
      type: 'input',
      name: 'keyword',
      label: '分类',
      placeholder: '搜索分类名称',
      maxLength: 64,
    },
  ];

  return (
    <>
      <SearchBar
        form={searchForm}
        items={searchItems}
        initialValues={search}
        showExpand={false}
        onSearch={(values) => updateSearch(values as CategoryListQuery)}
        onReset={resetSearch}
      />

      <Card className="border border-(--card-border) bg-(--default-box-color) p-4 rounded-[calc(var(--custom-radius)/2+2px)]">
        <TableHeader
          left={
            canCreate ? (
            <Button type="primary" onClick={() => openDrawer()}>
              新建分类
            </Button>
            ) : null
          }
          loading={saveMutation.isPending}
          onRefresh={() => refetch()}
        />
        <DataTable<Category>
          rowKey="id"
          dataSource={categories}
          pagination={{
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          columns={[
            { title: '分类名称', dataIndex: 'name' },
            { title: '排序', dataIndex: 'sortOrder', width: 120 },
            {
              title: '操作',
              width: 180,
              render: (_, category) =>
                canEdit || canDelete ? (
                <Space>
                  {canEdit ? (
                  <Button type="link" onClick={() => openDrawer(category)}>
                    编辑
                  </Button>
                  ) : null}
                  {canDelete ? (
                  <Popconfirm
                    title="删除分类"
                    description="删除后不可恢复，确认继续？"
                    okText="删除"
                    okButtonProps={{ danger: true }}
                    cancelText="取消"
                    onConfirm={() => deleteMutation.mutate(category.id)}
                  >
                    <Button type="link" danger loading={deleteMutation.isPending}>
                      删除
                    </Button>
                  </Popconfirm>
                  ) : null}
                </Space>
                ) : (
                  '-'
                ),
            },
          ]}
        />
      </Card>

      <Drawer
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={drawerOpen}
        onClose={closeDrawer}
        size={520}
        destroyOnHidden
        extra={
          <Space>
            <Button onClick={closeDrawer}>取消</Button>
            <Button
              type="primary"
              disabled={editingCategory ? !canEdit : !canCreate}
              loading={saveMutation.isPending}
              onClick={saveCategory}
            >
              保存
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" initialValues={{ sortOrder: 0 }}>
          <Form.Item label="分类名称" name="name" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input maxLength={64} placeholder="例如 家常菜" />
          </Form.Item>
          <Form.Item label="排序值" name="sortOrder" rules={[{ required: true, message: '请输入排序值' }]}>
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
