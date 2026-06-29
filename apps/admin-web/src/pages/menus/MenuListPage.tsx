import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  App as AntdApp,
  Button,
  Card,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Switch,
  Tag,
} from 'antd';
import { useMemo, useState } from 'react';
import {
  type AccessListQuery,
  type AdminMenu,
  type CreateMenuButtonInput,
  type CreateMenuInput,
  type MenuButton,
} from '@feed-plan/shared';
import { SvgIcon } from '~/components/core/base/svg-icon';
import { SearchBar, type SearchFormItem } from '~/components/core/search';
import { DataTable, TableHeader } from '~/components/core/tables';
import { IconSelect } from './components/IconSelect';
import { useCanButton } from '~/hooks/use-button-access';
import { api } from '~/lib/api-client';
import { getApiErrorMessage } from '~/lib/error-parser';
import { accessQueries } from '~/queries/access';
import './styles.css';

type MenuFormValues = CreateMenuInput;
type ButtonFormValues = Omit<CreateMenuButtonInput, 'menuId'>;
type MenuTreeNode = AdminMenu & { children?: MenuTreeNode[] };

const menuTypeOptions = [
  { label: '目录', value: 'directory' },
  { label: '内部页面', value: 'page' },
  { label: 'iframe', value: 'iframe' },
  { label: '外链', value: 'link' },
];

const layoutOptions = [
  { label: '后台布局', value: 'admin' },
  { label: '空白布局', value: 'blank' },
];

function getParentTitle(menus: AdminMenu[], parentId: string | null) {
  if (!parentId) return '-';
  return menus.find((menu) => menu.id === parentId)?.title ?? '-';
}

function buildMenuTree(menus: AdminMenu[]): MenuTreeNode[] {
  const nodes = new Map<string, MenuTreeNode>(menus.map((menu) => [menu.id, { ...menu }]));
  const roots: MenuTreeNode[] = [];

  for (const menu of menus) {
    const node = nodes.get(menu.id);
    if (!node) continue;

    const parent = menu.parentId ? nodes.get(menu.parentId) : undefined;
    if (parent) {
      parent.children = [...(parent.children ?? []), node];
      continue;
    }

    roots.push(node);
  }

  return roots;
}

function emptyToNull(value: string | null | undefined) {
  const text = value?.trim();
  return text ? text : null;
}

export function MenuListPage() {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();
  const canButton = useCanButton();
  const canCreate = canButton('system.menus', 'create');
  const canEdit = canButton('system.menus', 'edit');
  const canDelete = canButton('system.menus', 'delete');
  const canManageButtons = canButton('system.menus', 'buttons');
  const { data: menus, refetch } = useSuspenseQuery(accessQueries.menus(search));
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const [searchForm] = Form.useForm<AccessListQuery>();
  const [menuForm] = Form.useForm<MenuFormValues>();
  const [buttonForm] = Form.useForm<ButtonFormValues>();
  const [editingMenu, setEditingMenu] = useState<AdminMenu | null>(null);
  const [editingButton, setEditingButton] = useState<MenuButton | null>(null);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [buttonDrawerOpen, setButtonDrawerOpen] = useState(false);
  const [buttonMenu, setButtonMenu] = useState<AdminMenu | null>(null);
  const menuTree = useMemo(() => buildMenuTree(menus), [menus]);

  const parentOptions = useMemo(
    () =>
      menus
        .filter((menu) => menu.type === 'directory' && menu.id !== editingMenu?.id)
        .map((menu) => ({ label: menu.title, value: menu.id })),
    [editingMenu?.id, menus],
  );

  const invalidateMenus = async () => {
    await queryClient.invalidateQueries({ queryKey: ['menus'] });
    await queryClient.invalidateQueries({ queryKey: ['roles'] });
  };

  const saveMenuMutation = useMutation({
    mutationFn: (input: MenuFormValues) =>
      editingMenu ? api.menus.update(editingMenu.id, input) : api.menus.create(input),
    onSuccess: async () => {
      await invalidateMenus();
      message.success(editingMenu ? '菜单已更新' : '菜单已创建');
      closeMenuDrawer();
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const deleteMenuMutation = useMutation({
    mutationFn: api.menus.delete,
    onSuccess: async () => {
      await invalidateMenus();
      message.success('菜单已删除');
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const saveButtonMutation = useMutation({
    mutationFn: (input: ButtonFormValues) => {
      if (!buttonMenu) throw new Error('缺少所属菜单');
      return editingButton
        ? api.menus.updateButton(editingButton.id, input)
        : api.menus.createButton({ ...input, menuId: buttonMenu.id });
    },
    onSuccess: async () => {
      await invalidateMenus();
      message.success(editingButton ? '按钮已更新' : '按钮已创建');
      resetButtonForm();
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const deleteButtonMutation = useMutation({
    mutationFn: api.menus.deleteButton,
    onSuccess: async () => {
      await invalidateMenus();
      message.success('按钮已删除');
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const updateSearch = async (values: AccessListQuery) => {
    await navigate({ to: '/menus' as never, search: values as never });
  };

  const resetSearch = async () => {
    searchForm.resetFields();
    await navigate({ to: '/menus' as never, search: {} as never });
  };

  const openMenuDrawer = (menu?: AdminMenu) => {
    setEditingMenu(menu ?? null);
    setMenuDrawerOpen(true);
    menuForm.setFieldsValue(
      menu
        ? {
            parentId: menu.parentId,
            key: menu.key,
            title: menu.title,
            path: menu.path,
            icon: menu.icon,
            type: menu.type,
            componentKey: menu.componentKey,
            externalUrl: menu.externalUrl,
            openInNewTab: menu.openInNewTab,
            layoutKey: menu.layoutKey,
            isCache: menu.isCache,
            isTabVisible: menu.isTabVisible,
            isAffix: menu.isAffix,
            activeMenuKey: menu.activeMenuKey,
            sortOrder: menu.sortOrder,
            isVisible: menu.isVisible,
          }
        : {
            type: 'page',
            openInNewTab: false,
            layoutKey: 'admin',
            isCache: false,
            isTabVisible: true,
            isAffix: false,
            sortOrder: 0,
            isVisible: true,
          },
    );
  };

  const closeMenuDrawer = () => {
    setMenuDrawerOpen(false);
    setEditingMenu(null);
    menuForm.resetFields();
  };

  const openButtonDrawer = (menu: AdminMenu) => {
    setButtonMenu(menu);
    setButtonDrawerOpen(true);
    resetButtonForm();
  };

  const closeButtonDrawer = () => {
    setButtonDrawerOpen(false);
    setButtonMenu(null);
    resetButtonForm();
  };

  const editButton = (button: MenuButton) => {
    setEditingButton(button);
    buttonForm.setFieldsValue({
      key: button.key,
      name: button.name,
      action: button.action,
      sortOrder: button.sortOrder,
    });
  };

  const resetButtonForm = () => {
    setEditingButton(null);
    buttonForm.resetFields();
    buttonForm.setFieldsValue({ sortOrder: 0 });
  };

  const saveMenu = async () => {
    const values = await menuForm.validateFields();
    saveMenuMutation.mutate({
      ...values,
      activeMenuKey: emptyToNull(values.activeMenuKey),
      componentKey: emptyToNull(values.componentKey),
      externalUrl: emptyToNull(values.externalUrl),
      icon: emptyToNull(values.icon),
      parentId: values.parentId ?? null,
      path: emptyToNull(values.path),
    });
  };

  const saveButton = async () => {
    saveButtonMutation.mutate(await buttonForm.validateFields());
  };

  const searchItems: SearchFormItem[] = [
    {
      type: 'input',
      name: 'keyword',
      label: '菜单',
      placeholder: '搜索菜单标题或标识',
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
        onSearch={(values) => updateSearch(values as AccessListQuery)}
        onReset={resetSearch}
      />

      <Card className="border border-(--card-border) bg-(--default-box-color) p-4 rounded-[calc(var(--custom-radius)/2+2px)]">
        <TableHeader
          left={
            canCreate ? (
              <Button type="primary" onClick={() => openMenuDrawer()}>
                新建菜单
              </Button>
            ) : null
          }
          loading={saveMenuMutation.isPending}
          onRefresh={() => refetch()}
        />
        <DataTable<MenuTreeNode>
          rowKey="id"
          dataSource={menuTree}
          expandable={{
            columnWidth: 36,
            defaultExpandAllRows: true,
            expandIcon: ({ expanded, onExpand, record }) =>
              record.children?.length ? (
                <Button
                  type="text"
                  size="small"
                  className="menu-tree-expand"
                  icon={
                    <SvgIcon
                      icon={expanded ? 'lucide:chevron-down' : 'lucide:chevron-right'}
                      width={14}
                      height={14}
                    />
                  }
                  onClick={(event) => onExpand(record, event)}
                />
              ) : (
                <span className="menu-tree-expand-placeholder" />
              ),
            indentSize: 24,
          }}
          scroll={{ x: 'max-content' }}
          tableLayout="auto"
          pagination={{
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          columns={[
            {
              title: '菜单名称',
              dataIndex: 'title',
              render: (_, menu) => (
                <span className="menu-tree-title">
                  <span className="menu-tree-title-text">{menu.title}</span>
                  {menu.type === 'directory' ? <Tag className="menu-tree-kind">目录</Tag> : null}
                </span>
              ),
            },
            { title: '标识', dataIndex: 'key', width: 180 },
            {
              title: '上级菜单',
              width: 140,
              render: (_, menu) => getParentTitle(menus, menu.parentId),
            },
            {
              title: '类型',
              width: 100,
              render: (_, menu) => {
                const label = menuTypeOptions.find((item) => item.value === menu.type)?.label ?? menu.type;
                return <Tag color={menu.type === 'directory' ? undefined : 'blue'}>{label}</Tag>;
              },
            },
            { title: '路径', dataIndex: 'path', render: (_, menu) => menu.path ?? '-' },
            { title: '组件', dataIndex: 'componentKey', render: (_, menu) => menu.componentKey ?? '-' },
            { title: '排序', dataIndex: 'sortOrder', width: 90 },
            {
              title: '状态',
              width: 100,
              render: (_, menu) =>
                menu.isVisible ? <Tag color="green">显示</Tag> : <Tag>隐藏</Tag>,
            },
            {
              title: '按钮',
              width: 220,
              render: (_, menu) =>
                menu.buttons.length ? (
                  <Space size={[0, 4]} wrap>
                    {menu.buttons.map((button) => (
                      <Tag key={button.id}>{button.name}</Tag>
                    ))}
                  </Space>
                ) : (
                  '-'
                ),
            },
            {
              title: '操作',
              width: 220,
              fixed: 'right',
              render: (_, menu) =>
                canEdit || canManageButtons || canDelete ? (
                  <Space>
                    {canEdit ? (
                      <Button type="link" onClick={() => openMenuDrawer(menu)}>
                        编辑
                      </Button>
                    ) : null}
                    {canManageButtons ? (
                      <Button type="link" onClick={() => openButtonDrawer(menu)}>
                        按钮
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <Popconfirm
                        title="删除菜单"
                        description="存在子菜单时不能删除，确认继续？"
                        okText="删除"
                        okButtonProps={{ danger: true }}
                        cancelText="取消"
                        onConfirm={() => deleteMenuMutation.mutate(menu.id)}
                      >
                        <Button type="link" danger loading={deleteMenuMutation.isPending}>
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
        title={editingMenu ? '编辑菜单' : '新建菜单'}
        open={menuDrawerOpen}
        onClose={closeMenuDrawer}
        size={560}
        destroyOnHidden
        extra={
          <Space>
            <Button onClick={closeMenuDrawer}>取消</Button>
            <Button
              type="primary"
              disabled={editingMenu ? !canEdit : !canCreate}
              loading={saveMenuMutation.isPending}
              onClick={saveMenu}
            >
              保存
            </Button>
          </Space>
        }
      >
        <Form
          form={menuForm}
          layout="vertical"
          initialValues={{
            type: 'page',
            openInNewTab: false,
            layoutKey: 'admin',
            isCache: false,
            isTabVisible: true,
            isAffix: false,
            sortOrder: 0,
            isVisible: true,
          }}
        >
          <Form.Item label="上级菜单" name="parentId">
            <Select allowClear options={parentOptions} placeholder="不选则为一级菜单" />
          </Form.Item>
          <Form.Item
            label="标识"
            name="key"
            rules={[{ required: true, message: '请输入菜单标识' }]}
          >
            <Input maxLength={64} placeholder="例如 system.users" />
          </Form.Item>
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入菜单标题' }]}
          >
            <Input maxLength={64} />
          </Form.Item>
          <Form.Item
            label="类型"
            name="type"
            rules={[{ required: true, message: '请选择菜单类型' }]}
          >
            <Select options={menuTypeOptions} />
          </Form.Item>
          <Form.Item label="访问路径" name="path">
            <Input maxLength={128} placeholder="例如 /users，目录可留空" />
          </Form.Item>
          <Form.Item label="组件标识" name="componentKey">
            <Input maxLength={64} placeholder="例如 system.users，目录 / iframe / 外链可留空" />
          </Form.Item>
          <Form.Item label="外链地址" name="externalUrl">
            <Input maxLength={512} placeholder="iframe 或外链菜单使用，例如 https://example.com" />
          </Form.Item>
          <Form.Item label="外链新窗口打开" name="openInNewTab" valuePropName="checked">
            <Switch checkedChildren="新窗口" unCheckedChildren="当前页" />
          </Form.Item>
          <Form.Item label="布局" name="layoutKey">
            <Select options={layoutOptions} />
          </Form.Item>
          <Form.Item label="图标" name="icon">
            <IconSelect />
          </Form.Item>
          <Form.Item
            label="排序值"
            name="sortOrder"
            rules={[{ required: true, message: '请输入排序值' }]}
          >
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="菜单可见" name="isVisible" valuePropName="checked">
            <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
          </Form.Item>
          <Form.Item label="缓存页面" name="isCache" valuePropName="checked">
            <Switch checkedChildren="缓存" unCheckedChildren="不缓存" />
          </Form.Item>
          <Form.Item label="显示标签页" name="isTabVisible" valuePropName="checked">
            <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
          </Form.Item>
          <Form.Item label="固定标签页" name="isAffix" valuePropName="checked">
            <Switch checkedChildren="固定" unCheckedChildren="普通" />
          </Form.Item>
          <Form.Item label="激活菜单" name="activeMenuKey">
            <Input maxLength={64} placeholder="隐藏页或详情页可填写要高亮的菜单 key" />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title={buttonMenu ? `${buttonMenu.title} · 按钮权限` : '按钮权限'}
        open={buttonDrawerOpen}
        onClose={closeButtonDrawer}
        size={720}
        destroyOnHidden
      >
        <Form form={buttonForm} layout="vertical" initialValues={{ sortOrder: 0 }}>
          <Space align="start" wrap>
            <Form.Item
              label="标识"
              name="key"
              rules={[{ required: true, message: '请输入按钮标识' }]}
            >
              <Input maxLength={64} placeholder="create" style={{ width: 140 }} />
            </Form.Item>
            <Form.Item
              label="名称"
              name="name"
              rules={[{ required: true, message: '请输入按钮名称' }]}
            >
              <Input maxLength={64} placeholder="新建" style={{ width: 160 }} />
            </Form.Item>
            <Form.Item
              label="动作值"
              name="action"
              rules={[{ required: true, message: '请输入动作值' }]}
            >
              <Input maxLength={96} placeholder="users.create" style={{ width: 220 }} />
            </Form.Item>
            <Form.Item
              label="排序"
              name="sortOrder"
              rules={[{ required: true, message: '请输入排序值' }]}
            >
              <InputNumber min={0} precision={0} style={{ width: 100 }} />
            </Form.Item>
            <Form.Item label=" ">
              <Space>
                <Button
                  type="primary"
                  disabled={!canManageButtons}
                  loading={saveButtonMutation.isPending}
                  onClick={saveButton}
                >
                  {editingButton ? '更新按钮' : '新增按钮'}
                </Button>
                {editingButton ? <Button onClick={resetButtonForm}>取消编辑</Button> : null}
              </Space>
            </Form.Item>
          </Space>
        </Form>

        <DataTable<MenuButton>
          rowKey="id"
          dataSource={buttonMenu?.buttons ?? []}
          pagination={false}
          columns={[
            { title: '按钮名称', dataIndex: 'name' },
            { title: '标识', dataIndex: 'key', width: 140 },
            { title: '动作值', dataIndex: 'action', width: 200 },
            { title: '排序', dataIndex: 'sortOrder', width: 90 },
            {
              title: '操作',
              width: 140,
              render: (_, button) =>
                canManageButtons ? (
                  <Space>
                    <Button type="link" onClick={() => editButton(button)}>
                      编辑
                    </Button>
                    <Popconfirm
                      title="删除按钮"
                      description="删除后角色中的按钮授权会同步失效，确认继续？"
                      okText="删除"
                      okButtonProps={{ danger: true }}
                      cancelText="取消"
                      onConfirm={() => deleteButtonMutation.mutate(button.id)}
                    >
                      <Button type="link" danger loading={deleteButtonMutation.isPending}>
                        删除
                      </Button>
                    </Popconfirm>
                  </Space>
                ) : (
                  '-'
                ),
            },
          ]}
        />
      </Drawer>
    </>
  );
}
