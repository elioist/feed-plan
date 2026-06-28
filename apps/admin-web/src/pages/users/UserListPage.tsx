import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { UserOutlined } from '@ant-design/icons';
import {
  App as AntdApp,
  Avatar,
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
  type UpdateUserInput,
  type UpdateUserRolesInput,
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
import { AvatarUpload } from './components/AvatarUpload';

export function UserListPage() {
  const search = useSearch({ strict: false });
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
  const [roleForm] = Form.useForm<UpdateUserRolesInput>();
  const [editForm] = Form.useForm<UpdateUserInput>();
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null);
  const [roleUser, setRoleUser] = useState<AdminUser | null>(null);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const roleOptions = roles.map((role) => ({ label: role.name, value: role.id }));

  const invalidateUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const updateSearch = async (values: UserListQuery) => {
    await navigate({ to: '/users' as never, search: values as never });
  };

  const resetSearch = async () => {
    searchForm.resetFields();
    await navigate({ to: '/users' as never, search: {} as never });
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
      closeRoleDrawer();
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

  const editMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      api.users.updateProfile(id, input),
    onSuccess: async () => {
      await invalidateUsers();
      message.success('用户信息已更新');
      closeEditDrawer();
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

  const openRoleDrawer = (user: AdminUser) => {
    setRoleUser(user);
    roleForm.setFieldsValue({ roleIds: user.roles.map((role) => role.id) });
  };

  const closeRoleDrawer = () => {
    setRoleUser(null);
    roleForm.resetFields();
  };

  const openEditDrawer = (user: AdminUser) => {
    setEditUser(user);
    editForm.setFieldsValue({ username: user.username, avatar: user.avatar });
  };

  const closeEditDrawer = () => {
    setEditUser(null);
    editForm.resetFields();
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

  const submitRoles = async () => {
    if (!roleUser) return;
    roleMutation.mutate({
      id: roleUser.id,
      roleIds: (await roleForm.validateFields()).roleIds,
    });
  };

  const submitEdit = async () => {
    if (!editUser) return;
    editMutation.mutate({
      id: editUser.id,
      input: await editForm.validateFields(),
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

      <Card className="border border-(--card-border) bg-(--default-box-color) p-4 rounded-[calc(var(--custom-radius)/2+2px)]">
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
            {
              title: '头像',
              width: 80,
              render: (_, user) => (
                <Avatar
                  src={user.avatar}
                  size={40}
                  shape="square"
                  icon={!user.avatar && <UserOutlined />}
                  style={!user.avatar ? { backgroundColor: '#fae8df', color: '#c45a32' } : undefined}
                >
                  {user.username?.charAt(0)?.toUpperCase()}
                </Avatar>
              ),
            },
            { title: '用户名', dataIndex: 'username' },
            {
              title: '角色',
              render: (_, user) => {
                const isSelf = user.id === currentUserId;
                return (
                  <Space wrap>
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
              width: 300,
              render: (_, user) =>
                user.id === currentUserId || (!canEditRoles && !canResetPassword && !canDelete) ? (
                  '-'
                ) : (
                  <Space>
                    {canEditRoles ? (
                      <Button type="link" onClick={() => openEditDrawer(user)}>
                        编辑
                      </Button>
                    ) : null}
                    {canEditRoles ? (
                      <Button type="link" onClick={() => openRoleDrawer(user)}>
                        分配角色
                      </Button>
                    ) : null}
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
          <Form.Item
            label="角色"
            name="roleIds"
            rules={[{ required: true, message: '请选择至少一个角色' }]}
          >
            <Select mode="multiple" options={roleOptions} />
          </Form.Item>
          <Space>
            <Button
              type="primary"
              disabled={!canCreate}
              loading={createMutation.isPending}
              onClick={submitCreate}
            >
              保存
            </Button>
            <Button onClick={closeCreateDrawer}>取消</Button>
          </Space>
        </Form>
      </Drawer>

      <Drawer
        title={roleUser ? `分配 ${roleUser.username} 的角色` : '分配角色'}
        open={Boolean(roleUser)}
        onClose={closeRoleDrawer}
        size={520}
        destroyOnHidden
      >
        <Form form={roleForm} layout="vertical">
          <Form.Item
            label="角色"
            name="roleIds"
            rules={[{ required: true, message: '请选择至少一个角色' }]}
          >
            <Select mode="multiple" options={roleOptions} />
          </Form.Item>
          <Space>
            <Button
              type="primary"
              disabled={!canEditRoles}
              loading={roleMutation.isPending}
              onClick={submitRoles}
            >
              保存
            </Button>
            <Button onClick={closeRoleDrawer}>取消</Button>
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

      <Drawer
        title={editUser ? `编辑 ${editUser.username}` : '编辑用户'}
        open={Boolean(editUser)}
        onClose={closeEditDrawer}
        size={520}
        destroyOnHidden
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="头像" name="avatar">
            <AvatarUpload username={editUser?.username} />
          </Form.Item>
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { max: 64, message: '用户名最多 64 个字符' },
            ]}
          >
            <Input maxLength={64} />
          </Form.Item>
          <Space>
            <Button
              type="primary"
              disabled={!canEditRoles}
              loading={editMutation.isPending}
              onClick={submitEdit}
            >
              保存
            </Button>
            <Button onClick={closeEditDrawer}>取消</Button>
          </Space>
        </Form>
      </Drawer>
    </>
  );
}
