import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { App as AntdApp, Button, Card, Form, Input, Modal, Popconfirm, Space } from 'antd';
import { useEffect, useState } from 'react';
import type { Category, CategoryListQuery, CreateCategoryInput } from '@feed-plan/shared';
import { SearchBar, type SearchFormItem } from '~/components/core/search';
import { SortableDataTable, TableHeader } from '~/components/core/tables';
import { useCanButton } from '~/hooks/use-button-access';
import { api } from '~/lib/api-client';
import { getApiErrorMessage } from '~/lib/error-parser';
import { categoryQueries } from '~/queries/categories';

type CategoryFormValues = Pick<CreateCategoryInput, 'name'>;

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
  const [modalOpen, setModalOpen] = useState(false);
  const [orderedCategories, setOrderedCategories] = useState<Category[]>(categories);
  const keyword = typeof search.keyword === 'string' ? search.keyword.trim() : '';

  useEffect(() => {
    setOrderedCategories(categories);
  }, [categories]);

  const invalidateCategories = async () => {
    await queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const saveMutation = useMutation({
    mutationFn: (input: CategoryFormValues) =>
      editingCategory
        ? api.categories.update(editingCategory.id, input)
        : api.categories.create({
            ...input,
            sortOrder:
              categories.reduce((max, category) => Math.max(max, category.sortOrder), 0) + 10,
          }),
    onSuccess: async () => {
      await invalidateCategories();
      message.success(editingCategory ? '分类已更新' : '分类已创建');
      closeModal();
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

  const reorderMutation = useMutation({
    mutationFn: (items: Category[]) => {
      const ids = items.map((item) => item.id).filter((id): id is string => Boolean(id));
      if (ids.length !== items.length) {
        throw new Error('排序数据异常，请刷新后重试');
      }
      return api.categories.reorder({ ids });
    },
    onSuccess: async () => {
      await invalidateCategories();
      message.success('分类排序已更新');
    },
    onError: (error) => {
      setOrderedCategories(categories);
      message.error(getApiErrorMessage(error));
    },
  });

  const updateSearch = async (values: CategoryListQuery) => {
    await navigate({ to: '/categories' as never, search: values as never });
  };

  const resetSearch = async () => {
    searchForm.resetFields();
    await navigate({ to: '/categories' as never, search: {} as never });
  };

  const openModal = (category?: Category) => {
    setEditingCategory(category ?? null);
    setModalOpen(true);
    form.setFieldsValue(category ? { name: category.name } : { name: '' });
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const saveCategory = async () => {
    saveMutation.mutate(await form.validateFields());
  };

  const sortCategories = (items: Category[]) => {
    setOrderedCategories(items);
    reorderMutation.mutate(items);
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
              <Button type="primary" onClick={() => openModal()}>
                新建分类
              </Button>
            ) : null
          }
          loading={saveMutation.isPending}
          onRefresh={() => refetch()}
        />
        <SortableDataTable<Category>
          rowKey="id"
          dataSource={orderedCategories}
          disabled={
            !canEdit ||
            Boolean(keyword) ||
            reorderMutation.isPending ||
            orderedCategories.length < 2
          }
          pagination={false}
          onSortEnd={sortCategories}
          columns={[
            { title: '分类名称', dataIndex: 'name' },
            { title: '顺序', width: 120, render: (_, __, index) => index + 1 },
            {
              title: '操作',
              width: 180,
              render: (_, category) =>
                canEdit || canDelete ? (
                  <Space>
                    {canEdit ? (
                      <Button type="link" onClick={() => openModal(category)}>
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

      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={modalOpen}
        width={480}
        destroyOnHidden
        okText="保存"
        cancelText="取消"
        confirmLoading={saveMutation.isPending}
        okButtonProps={{ disabled: editingCategory ? !canEdit : !canCreate }}
        onCancel={closeModal}
        onOk={saveCategory}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="分类名称"
            name="name"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input maxLength={64} placeholder="例如 家常菜" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
