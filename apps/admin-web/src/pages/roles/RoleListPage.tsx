import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  App as AntdApp,
  Button,
  Card,
  Checkbox,
  Drawer,
  Form,
  Input,
  Popconfirm,
  Space,
  Tabs,
  Tag,
  Tree,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import {
  type AccessListQuery,
  type AdminMenu,
  type Role,
} from '@feed-plan/shared';
import { SearchBar, type SearchFormItem } from '~/components/core/search';
import { DataTable, TableHeader } from '~/components/core/tables';
import { useCanButton } from '~/hooks/use-button-access';
import { api } from '~/lib/api-client';
import { getApiErrorMessage } from '~/lib/error-parser';
import { accessQueries } from '~/queries/access';

interface RoleFormValues {
  description?: string;
  key: string;
  name: string;
}
interface MenuTreeNode {
  key: string;
  title: string;
  children?: MenuTreeNode[];
}

function buildMenuTree(menus: AdminMenu[]) {
  const byParent = new Map<string | null, AdminMenu[]>();
  for (const menu of menus) {
    const list = byParent.get(menu.parentId) ?? [];
    list.push(menu);
    byParent.set(menu.parentId, list);
  }

  const toNode = (menu: AdminMenu): MenuTreeNode => {
    const children = byParent.get(menu.id)?.map(toNode);
    return {
      key: menu.id,
      title: menu.path ? `${menu.title}（${menu.path}）` : menu.title,
      children,
    };
  };

  return (byParent.get(null) ?? []).map(toNode);
}

function includeParentMenus(menuIds: string[], menus: AdminMenu[]) {
  const selected = new Set(menuIds);
  const menuById = new Map(menus.map((menu) => [menu.id, menu]));
  for (const menuId of menuIds) {
    let parentId = menuById.get(menuId)?.parentId;
    while (parentId) {
      selected.add(parentId);
      parentId = menuById.get(parentId)?.parentId;
    }
  }
  return [...selected];
}

export function RoleListPage() {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();
  const canButton = useCanButton();
  const canCreate = canButton('system.roles', 'create');
  const canEdit = canButton('system.roles', 'edit');
  const canAuthorize = canButton('system.roles', 'authorize');
  const canDelete = canButton('system.roles', 'delete');
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const { data: roles, refetch } = useSuspenseQuery(accessQueries.roles(search));
  const { data: menus } = useSuspenseQuery(accessQueries.menus());
  const [searchForm] = Form.useForm<AccessListQuery>();
  const [form] = Form.useForm<RoleFormValues>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([]);
  const [selectedButtonIds, setSelectedButtonIds] = useState<string[]>([]);
  const menuTreeData = useMemo(() => buildMenuTree(menus), [menus]);
  const menuAccessQuery = useQuery({
    ...accessQueries.roleMenuAccess(editingRole?.id ?? ''),
    enabled: drawerOpen && Boolean(editingRole),
  });

  useEffect(() => {
    if (!menuAccessQuery.data) return;
    setSelectedMenuIds(menuAccessQuery.data.menuIds);
    setSelectedButtonIds(menuAccessQuery.data.buttonIds);
  }, [menuAccessQuery.data]);

  const invalidateRoles = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['roles'] }),
      queryClient.invalidateQueries({ queryKey: ['menus'] }),
    ]);
  };

  const updateSearch = async (values: AccessListQuery) => {
    await navigate({ to: '/roles' as never, search: values as never });
  };

  const resetSearch = async () => {
    searchForm.resetFields();
    await navigate({ to: '/roles' as never, search: {} as never });
  };

  const saveMutation = useMutation({
    mutationFn: async (input: RoleFormValues) => {
      const accessInput = {
        menuIds: includeParentMenus(selectedMenuIds, menus),
        buttonIds: selectedButtonIds,
      };
      const role = editingRole
        ? canEdit
          ? await api.roles.update(editingRole.id, input)
          : editingRole
        : await api.roles.create({ ...input, ...accessInput });
      if (canAuthorize) {
        await api.menus.updateRoleAccess(role.id, accessInput);
      }
      return role;
    },
    onSuccess: async () => {
      await invalidateRoles();
      message.success(editingRole ? '角色已更新' : '角色已创建');
      closeDrawer();
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: api.roles.delete,
    onSuccess: async () => {
      await invalidateRoles();
      message.success('角色已删除');
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const openDrawer = (role?: Role) => {
    setEditingRole(role ?? null);
    setDrawerOpen(true);
    setSelectedMenuIds(role?.menuIds ?? []);
    setSelectedButtonIds(role?.buttonIds ?? []);
    form.setFieldsValue(
      role
        ? {
            key: role.key,
            name: role.name,
            description: role.description ?? undefined,
          }
        : {},
    );
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingRole(null);
    setSelectedMenuIds([]);
    setSelectedButtonIds([]);
    form.resetFields();
  };

  const saveRole = async () => {
    saveMutation.mutate(await form.validateFields());
  };

  const updateSelectedMenus = (menuIds: string[]) => {
    const nextMenuIds = includeParentMenus(menuIds, menus);
    const nextMenuSet = new Set(nextMenuIds);
    const allowedButtonIds = new Set(
      menus.flatMap((menu) => (nextMenuSet.has(menu.id) ? menu.buttons.map((button) => button.id) : [])),
    );
    setSelectedMenuIds(nextMenuIds);
    setSelectedButtonIds((current) => current.filter((buttonId) => allowedButtonIds.has(buttonId)));
  };

  const searchItems: SearchFormItem[] = [
    {
      type: 'input',
      name: 'keyword',
      label: '角色',
      placeholder: '搜索角色名称或标识',
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

      <Card className="border border-(--card-border) bg-(--default-box-color) p-4 rounded-[calc(var(--custom-radius)/2+2px)]">
        <TableHeader
          left={
            canCreate ? (
            <Button type="primary" onClick={() => openDrawer()}>
              新建角色
            </Button>
            ) : null
          }
          loading={saveMutation.isPending}
          onRefresh={() => refetch()}
        />
        <DataTable<Role>
          rowKey="id"
          dataSource={roles}
          pagination={{
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          columns={[
            { title: '角色名称', dataIndex: 'name', width: 120 },
            { title: '标识', dataIndex: 'key', width: 180 },
            { title: '描述', dataIndex: 'description' },
            {
              title: '授权范围',
              render: (_, role) =>
                role.menuIds.length || role.buttonIds.length ? (
                  <Space wrap>
                    <Tag color="blue">{role.menuIds.length} 个菜单</Tag>
                    <Tag color="green">{role.buttonIds.length} 个按钮</Tag>
                  </Space>
                ) : '-',
            },
            {
              title: '操作',
              width: 160,
              render: (_, role) =>
                canEdit || canAuthorize || canDelete ? (
                <Space>
                  {canEdit || canAuthorize ? (
                  <Button type="link" onClick={() => openDrawer(role)}>
                    {canEdit ? '编辑' : '授权'}
                  </Button>
                  ) : null}
                  {canDelete ? (
                  <Popconfirm
                    title="删除角色"
                    description="删除后不可恢复，确认继续？"
                    okText="删除"
                    okButtonProps={{ danger: true }}
                    cancelText="取消"
                    onConfirm={() => deleteMutation.mutate(role.id)}
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
        title={editingRole ? '编辑角色' : '新建角色'}
        open={drawerOpen}
        onClose={closeDrawer}
        size={560}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item label="标识" name="key" rules={[{ required: true, message: '请输入角色标识' }]}>
            <Input
              disabled={editingRole ? !canEdit : !canCreate}
              maxLength={64}
              placeholder="例如 kitchen.manager"
            />
          </Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input disabled={editingRole ? !canEdit : !canCreate} maxLength={64} />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea disabled={editingRole ? !canEdit : !canCreate} maxLength={255} rows={3} />
          </Form.Item>
          <Tabs
            items={[
              {
                key: 'menus',
                label: '菜单权限',
                disabled: !canAuthorize,
                children: (
                  <Tree
                    checkable
                    checkStrictly
                    defaultExpandAll
                    selectable={false}
                    treeData={menuTreeData}
                    checkedKeys={selectedMenuIds}
                    onCheck={(checkedKeys) => {
                      updateSelectedMenus(
                        Array.isArray(checkedKeys) ? checkedKeys.map(String) : checkedKeys.checked.map(String),
                      );
                    }}
                  />
                ),
              },
              {
                key: 'buttons',
                label: '按钮权限',
                disabled: !canAuthorize,
                children: (
                  <div style={{ display: 'grid', gap: 16, width: '100%' }}>
                    {menus
                      .filter((menu) => menu.buttons.length > 0)
                      .map((menu) => (
                        <div key={menu.id}>
                          <div style={{ marginBottom: 8, fontWeight: 500 }}>{menu.title}</div>
                          <Checkbox.Group
                            value={selectedButtonIds}
                            options={menu.buttons.map((button) => ({
                              label: `${button.name}（${button.action}）`,
                              value: button.id,
                              disabled: !selectedMenuIds.includes(menu.id),
                            }))}
                            onChange={(values) => setSelectedButtonIds(values.map(String))}
                          />
                        </div>
                      ))}
                  </div>
                ),
              },
            ]}
          />
          <Space>
            <Button
              type="primary"
              disabled={editingRole ? !canEdit && !canAuthorize : !canCreate}
              loading={saveMutation.isPending}
              onClick={saveRole}
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
