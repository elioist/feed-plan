import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  App as AntdApp,
} from 'antd';
import { useState } from 'react';
import type { Category, CreateCategoryInput } from '@feed-plan/shared';
import { PageScaffold } from '~/shared/components/PageScaffold';
import {
  categoryQueries,
  createCategory,
  deleteCategory,
  updateCategory,
} from '~/features/categories/api';

export function CategoryListPage() {
  const { data } = useSuspenseQuery(categoryQueries.all());
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm<CreateCategoryInput>();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const invalidateCategories = async () => {
    await queryClient.invalidateQueries({ queryKey: categoryQueries.all().queryKey });
  };

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: async () => {
      await invalidateCategories();
      message.success('分类已创建');
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateCategoryInput }) =>
      updateCategory(id, input),
    onSuccess: async () => {
      await invalidateCategories();
      message.success('分类已更新');
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await invalidateCategories();
      message.success('分类已删除');
    },
    onError: () => {
      message.error('删除失败，可能仍有菜谱引用该分类');
    },
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    form.setFieldsValue({ name: '', sortOrder: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({ name: category.name, sortOrder: category.sortOrder });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, input: values });
      return;
    }

    createMutation.mutate(values);
  };

  return (
    <>
      <PageScaffold
        title="分类管理"
        breadcrumbItems={[{ title: '首页' }, { title: '分类管理' }]}
        tabs={[{ key: 'list', label: '分类列表' }]}
        activeTabKey="list"
        actions={
          <Button type="primary" onClick={openCreateModal}>
            新建分类
          </Button>
        }
      >
        <Table
          rowKey="id"
          dataSource={data}
          pagination={{
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          columns={[
            { title: '名称', dataIndex: 'name' },
            { title: '排序', dataIndex: 'sortOrder', width: 120 },
            {
              title: '操作',
              width: 180,
              render: (_, category) => (
                <Space>
                  <Button type="link" onClick={() => openEditModal(category)}>
                    编辑
                  </Button>
                  <Popconfirm
                    title="删除分类"
                    description="删除后不可恢复，确认继续？"
                    okText="删除"
                    cancelText="取消"
                    onConfirm={() => deleteMutation.mutate(category.id)}
                  >
                    <Button type="link" danger>
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </PageScaffold>
      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical" initialValues={{ sortOrder: 0 }}>
          <Form.Item
            label="分类名称"
            name="name"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input maxLength={64} />
          </Form.Item>
          <Form.Item
            label="排序值"
            name="sortOrder"
            rules={[{ required: true, message: '请输入排序值' }]}
          >
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
