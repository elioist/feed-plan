import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  App as AntdApp,
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Tag,
} from 'antd';
import { useState } from 'react';
import {
  type AdminUser,
  type CreateUserInput,
  type ResetUserPasswordInput,
  type UserListQuery,
} from '@feed-plan/shared';
import { SearchBar, type SearchFormItem } from '~/components/core/search';
import { DataTable, TableHeader } from '~/components/core/tables';
import { useCanButton } from '~/hooks/use-button-access';
import { api } from '~/lib/api-client';
import { getApiErrorMessage } from '~/lib/error-parser';
import { accessQueries } from '~/queries/access';
import { userQueries } from '~/queries/users';
import { useAuthStore } from '~/store/modules/auth';

export function UserListPage() {
  const search = useSearch({ from: '/_authenticated/users' });
  const navigate = useNavigate();
  const canButton = useCanButton();
  const canCreate = canButton('system.users', 'create');
  const canEditRoles = canButton('system.users', 'edit-roles');
  const canResetPassword = canButton('system.users', 'reset-password');
  const canDelete = canButton('system.users', 'delete');
  const { data: users, refetch } = useSuspenseQuery(userQueries.list(search));
  const { data: roles } = useSuspenseQuery(accessQueries.roles());
  const currentUserId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const [searchForm] = Form.useForm<UserListQuery>();
  const [createForm] = Form.useForm<CreateUserInput>();
  const [passwordForm] = Form.useForm<ResetUserPasswordInput>();
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null);
  const roleOptions = roles.map((role) => ({ label: role.name, value: role.id }));

  const invalidateUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const updateSearch = async (values: UserListQuery) => {
    await navigate({ to: '/users', search: values });
  };

  const resetSearch = async () => {
    searchForm.resetFields();
    await navigate({ to: '/users', search: {} });
  };

  const createMutation = useMutation({
    mutationFn: api.users.create,
    onSuccess: async () => {
      await invalidateUsers();
      message.success('用户已创建');
      closeCreateDrawer();
    },
    onError: (error) => {
      message.error(getApiErrorMessage(error));
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
      api.users.updateRoles(id, { roleIds }),
    onSuccess: async () => {
      await invalidateUsers();
      message.success('角色已更新');
    },
    onError: (error) => {
      message.error(getApiErrorMessage(error));
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ResetUserPasswordInput }) =>
      api.users.resetPassword(id, input),
    onSuccess: async () => {
      await invalidateUsers();
      message.success('密码已重置');
      closePasswordDrawer();
    },
    onError: (error) => {
      message.error(getApiErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.users.delete,
    onSuccess: async () => {
      await invalidateUsers();
      message.success('用户已删除');
    },
    onError: (error) => {
      message.error(getApiErrorMessage(error));
    },
  });

  const openCreateDrawer = () => {
    createForm.resetFields();
    setCreateDrawerOpen(true);
  };

  const closeCreateDrawer = () => {
    setCreateDrawerOpen(false);
    createForm.resetFields();
  };

  const openPasswordDrawer = (user: AdminUser) => {
    setPasswordUser(user);
    passwordForm.resetFields();
  };

  const closePasswordDrawer = () => {
    setPasswordUser(null);
    passwordForm.resetFields();
  };

  const submitCreate = async () => {
    createMutation.mutate(await createForm.validateFields());
  };

  const submitPassword = async () => {
    if (!passwordUser) return;
    resetPasswordMutation.mutate({
      id: passwordUser.id,
      input: await passwordForm.validateFields(),
    });
  };

  const searchItems: SearchFormItem[] = [
    {
      type: 'input',
      name: 'keyword',
      label: '用户名',
      placeholder: '搜索用户名',
    },
    {
      type: 'select',
      name: 'roleId',
      label: '角色',
      placeholder: '筛选角色',
      options: roleOptions,
    },
  ];

  return (
    <>
      <SearchBar
        form={searchForm}
        items={searchItems}
        initialValues={search}
        showExpand={false}
        onSearch={(values) => updateSearch(values as UserListQuery)}
        onReset={resetSearch}
      />

      <Card className="art-table-card">
        <TableHeader
          left={
            canCreate ? (
            <Button type="primary" onClick={openCreateDrawer}>
              新建用户
            </Button>
            ) : null
          }
          loading={createMutation.isPending}
          onRefresh={() => refetch()}
        />
        <DataTable<AdminUser>
          rowKey="id"
          dataSource={users}
          pagination={{
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          columns={[
            { title: '用户名', dataIndex: 'username' },
            {
              title: '角色',
              render: (_, user) => {
                const isSelf = user.id === currentUserId;
                return (
                  <Space wrap>
                    <Select
                      mode="multiple"
                      value={user.roles.map((role) => role.id)}
                      options={roleOptions}
                      style={{ minWidth: 220 }}
                      disabled={isSelf || !canEditRoles || roleMutation.isPending}
                      onChange={(roleIds) => roleMutation.mutate({ id: user.id, roleIds })}
                    />
                    {user.roles.map((role) => (
                      <Tag key={role.id}>{role.name}</Tag>
                    ))}
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
              width: 180,
              render: (_, user) =>
                user.id === currentUserId || (!canResetPassword && !canDelete) ? (
                  '-'
                ) : (
                  <Space>
                    {canResetPassword ? (
                    <Button type="link" onClick={() => openPasswordDrawer(user)}>
                      重置密码
                    </Button>
                    ) : null}
                    {canDelete ? (
                    <Popconfirm
                      title="删除用户"
                      description="删除后不可恢复，确认继续？"
                      okText="删除"
                      okButtonProps={{ danger: true }}
                      cancelText="取消"
                      onConfirm={() => deleteMutation.mutate(user.id)}
                    >
                      <Button type="link" danger loading={deleteMutation.isPending}>
                        删除
                      </Button>
                    </Popconfirm>
                    ) : null}
                  </Space>
                ),
            },
          ]}
        />
      </Card>

      <Drawer
        title="新建用户"
        open={createDrawerOpen}
        onClose={closeCreateDrawer}
        size={520}
        destroyOnHidden
      >
        <Form form={createForm} layout="vertical">
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
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
          <Form.Item label="角色" name="roleIds" rules={[{ required: true, message: '请选择至少一个角色' }]}>
            <Select mode="multiple" options={roleOptions} />
          </Form.Item>
          <Space>
            <Button type="primary" disabled={!canCreate} loading={createMutation.isPending} onClick={submitCreate}>
              保存
            </Button>
            <Button onClick={closeCreateDrawer}>取消</Button>
          </Space>
        </Form>
      </Drawer>

      <Drawer
        title={passwordUser ? `重置 ${passwordUser.username} 的密码` : '重置密码'}
        open={Boolean(passwordUser)}
        onClose={closePasswordDrawer}
        size={480}
        destroyOnHidden
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            label="新密码"
            name="password"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少 6 位' },
            ]}
          >
            <Input.Password maxLength={128} />
          </Form.Item>
          <Space>
            <Button
              type="primary"
              disabled={!canResetPassword}
              loading={resetPasswordMutation.isPending}
              onClick={submitPassword}
            >
              保存
            </Button>
            <Button onClick={closePasswordDrawer}>取消</Button>
          </Space>
        </Form>
      </Drawer>
    </>
  );
}
