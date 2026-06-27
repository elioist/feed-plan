import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { App as AntdApp, Button, Card, Drawer, Form, Input, Popconfirm, Space } from 'antd';
import { useState } from 'react';
import {
  type AccessListQuery,
  type CreatePermissionInput,
  type Permission,
} from '@feed-plan/shared';
import { SearchBar, type SearchFormItem } from '~/components/core/search';
import { DataTable, TableHeader } from '~/components/core/tables';
import { useCanButton } from '~/hooks/use-button-access';
import { api } from '~/lib/api-client';
import { getApiErrorMessage } from '~/lib/error-parser';
import { accessQueries } from '~/queries/access';

type PermissionFormValues = CreatePermissionInput;

export function PermissionListPage() {
  const search = useSearch({ from: '/_authenticated/permissions' });
  const navigate = useNavigate();
  const canButton = useCanButton();
  const canCreate = canButton('system.permissions', 'create');
  const canEdit = canButton('system.permissions', 'edit');
  const canDelete = canButton('system.permissions', 'delete');
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const { data: permissions, refetch } = useSuspenseQuery(accessQueries.permissions(search));
  const [searchForm] = Form.useForm<AccessListQuery>();
  const [form] = Form.useForm<PermissionFormValues>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  const invalidatePermissions = async () => {
    await queryClient.invalidateQueries({ queryKey: ['permissions'] });
  };

  const updateSearch = async (values: AccessListQuery) => {
    await navigate({ to: '/permissions', search: values });
  };

  const resetSearch = async () => {
    searchForm.resetFields();
    await navigate({ to: '/permissions', search: {} });
  };

  const saveMutation = useMutation({
    mutationFn: (input: PermissionFormValues) =>
      editingPermission
        ? api.permissions.update(editingPermission.id, input)
        : api.permissions.create(input),
    onSuccess: async () => {
      await invalidatePermissions();
      message.success(editingPermission ? '权限点已更新' : '权限点已创建');
      closeDrawer();
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: api.permissions.delete,
    onSuccess: async () => {
      await invalidatePermissions();
      message.success('权限点已删除');
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const openDrawer = (permission?: Permission) => {
    setEditingPermission(permission ?? null);
    setDrawerOpen(true);
    form.setFieldsValue(
      permission
        ? {
            key: permission.key,
            name: permission.name,
            description: permission.description ?? undefined,
          }
        : {},
    );
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingPermission(null);
    form.resetFields();
  };

  const savePermission = async () => {
    saveMutation.mutate(await form.validateFields());
  };

  const searchItems: SearchFormItem[] = [
    {
      type: 'input',
      name: 'keyword',
      label: '权限点',
      placeholder: '搜索权限点名称或标识',
    },
  ];

  return (
    <>
      <SearchBar
        form={searchForm}
        items={searchItems}
        initialValues={search}
        showExpand={false}
        onSearch={(values) => updateSearch(values as AccessListQuery)}
        onReset={resetSearch}
      />

      <Card className="art-table-card">
        <TableHeader
          left={
            canCreate ? (
            <Button type="primary" onClick={() => openDrawer()}>
              新建权限点
            </Button>
            ) : null
          }
          loading={saveMutation.isPending}
          onRefresh={() => refetch()}
        />
        <DataTable<Permission>
          rowKey="id"
          dataSource={permissions}
          pagination={{
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          columns={[
            { title: '权限点名称', dataIndex: 'name' },
            { title: '标识', dataIndex: 'key', width: 220 },
            { title: '描述', dataIndex: 'description' },
            {
              title: '操作',
              width: 160,
              render: (_, permission) =>
                canEdit || canDelete ? (
                <Space>
                  {canEdit ? (
                  <Button type="link" onClick={() => openDrawer(permission)}>
                    编辑
                  </Button>
                  ) : null}
                  {canDelete ? (
                  <Popconfirm
                    title="删除权限点"
                    description="删除后不可恢复，确认继续？"
                    okText="删除"
                    okButtonProps={{ danger: true }}
                    cancelText="取消"
                    onConfirm={() => deleteMutation.mutate(permission.id)}
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
        title={editingPermission ? '编辑权限点' : '新建权限点'}
        open={drawerOpen}
        onClose={closeDrawer}
        size={520}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item label="标识" name="key" rules={[{ required: true, message: '请输入权限点标识' }]}>
            <Input maxLength={64} placeholder="例如 recipes.manage" />
          </Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入权限点名称' }]}>
            <Input maxLength={64} />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea maxLength={255} rows={3} />
          </Form.Item>
          <Space>
            <Button
              type="primary"
              disabled={editingPermission ? !canEdit : !canCreate}
              loading={saveMutation.isPending}
              onClick={savePermission}
            >
              保存
            </Button>
            <Button onClick={closeDrawer}>取消</Button>
          </Space>
        </Form>
      </Drawer>
    </>
  );
}
