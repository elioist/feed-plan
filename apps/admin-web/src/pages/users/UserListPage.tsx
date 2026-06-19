import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tag,
  App as AntdApp,
} from 'antd';
import { useState } from 'react';
import type { AdminUser, CreateUserInput, Role } from '@feed-plan/shared';
import { ROLES } from '@feed-plan/shared';
import { DataTable, TableHeader } from '~/components/core/tables';
import { createUser, deleteUser, updateUserRole } from '~/api/users';
import { userQueries } from '~/queries/users';
import { useAuthStore } from '~/store/modules/auth';

const roleLabels: Record<Role, string> = {
  chef: '主厨',
  diner: '食客',
};

const roleOptions = ROLES.map((role) => ({ label: roleLabels[role], value: role }));

export function UserListPage() {
  const { data, refetch } = useSuspenseQuery(userQueries.all());
  const currentUserId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm<CreateUserInput>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const invalidateUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: userQueries.all().queryKey });
  };

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      await invalidateUsers();
      message.success('用户已创建');
      closeModal();
    },
    onError: () => {
      message.error('创建失败，用户名可能已存在');
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => updateUserRole(id, role),
    onSuccess: async () => {
      await invalidateUsers();
      message.success('角色已更新');
    },
    onError: () => {
      message.error('角色更新失败');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await invalidateUsers();
      message.success('用户已删除');
    },
    onError: () => {
      message.error('删除失败，该用户可能已创建点餐记录');
    },
  });

  const openCreateModal = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    createMutation.mutate(values);
  };

  return (
    <>
      <Card className="art-table-card">
        <TableHeader
          left={
            <Button type="primary" onClick={openCreateModal}>
              新建用户
            </Button>
          }
          loading={createMutation.isPending}
          onRefresh={() => refetch()}
        />
        <DataTable<AdminUser>
          rowKey="id"
          dataSource={data}
          pagination={{
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          columns={[
            { title: '用户名', dataIndex: 'username' },
            {
              title: '角色',
              width: 160,
              render: (_, user) => {
                const isSelf = user.id === currentUserId;
                return (
                  <Space>
                    <Select<Role>
                      value={user.role}
                      options={roleOptions}
                      style={{ width: 96 }}
                      disabled={isSelf || roleMutation.isPending}
                      onChange={(role) => roleMutation.mutate({ id: user.id, role })}
                    />
                    {isSelf ? <Tag color="blue">本人</Tag> : null}
                  </Space>
                );
              },
            },
            {
              title: '创建时间',
              width: 200,
              render: (_, user) => new Date(user.createdAt).toLocaleString('zh-CN'),
            },
            {
              title: '操作',
              width: 120,
              render: (_, user) =>
                user.id === currentUserId ? (
                  '-'
                ) : (
                  <Popconfirm
                    title="删除用户"
                    description="删除后不可恢复，确认继续？"
                    okText="删除"
                    okButtonProps={{ danger: true }}
                    cancelText="取消"
                    onConfirm={() => deleteMutation.mutate(user.id)}
                  >
                    <Button type="link" danger>
                      删除
                    </Button>
                  </Popconfirm>
                ),
            },
          ]}
        />
      </Card>
      <Modal
        title="新建用户"
        open={isModalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical" initialValues={{ role: 'diner' }}>
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input maxLength={64} />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少 6 位' },
            ]}
          >
            <Input.Password maxLength={128} />
          </Form.Item>
          <Form.Item label="角色" name="role" rules={[{ required: true, message: '请选择角色' }]}>
            <Select options={roleOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
