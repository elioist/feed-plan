import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  App as AntdApp,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Tag as AntTag,
} from 'antd';
import { useEffect, useState } from 'react';
import type { CreateTagInput, Tag, TagListQuery } from '@feed-plan/shared';
import { SearchBar, type SearchFormItem } from '~/components/core/search';
import { SortableDataTable, TableHeader } from '~/components/core/tables';
import { useCanButton } from '~/hooks/use-button-access';
import { api } from '~/lib/api-client';
import { getApiErrorMessage } from '~/lib/error-parser';
import { tagQueries } from '~/queries/tags';

type TagFormValues = Pick<CreateTagInput, 'name'>;

export function TagListPage() {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();
  const canButton = useCanButton();
  const canCreate = canButton('recipes.tags', 'create');
  const canEdit = canButton('recipes.tags', 'edit');
  const canDelete = canButton('recipes.tags', 'delete');
  const { data: tags, refetch } = useSuspenseQuery(tagQueries.list(search));
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const [searchForm] = Form.useForm<TagListQuery>();
  const [form] = Form.useForm<TagFormValues>();
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [orderedTags, setOrderedTags] = useState<Tag[]>(tags);
  const keyword = typeof search.keyword === 'string' ? search.keyword.trim() : '';

  useEffect(() => {
    setOrderedTags(tags);
  }, [tags]);

  const invalidateTags = async () => {
    await queryClient.invalidateQueries({ queryKey: ['tags'] });
  };

  const saveMutation = useMutation({
    mutationFn: (input: TagFormValues) =>
      editingTag
        ? api.tags.update(editingTag.id, input)
        : api.tags.create({
            ...input,
            sortOrder: tags.reduce((max, tag) => Math.max(max, tag.sortOrder), 0) + 10,
          }),
    onSuccess: async () => {
      await invalidateTags();
      message.success(editingTag ? '标签已更新' : '标签已创建');
      closeModal();
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: api.tags.delete,
    onSuccess: async () => {
      await invalidateTags();
      message.success('标签已删除');
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });

  const reorderMutation = useMutation({
    mutationFn: (items: Tag[]) => {
      const ids = items.map((item) => item.id).filter((id): id is string => Boolean(id));
      if (ids.length !== items.length) {
        throw new Error('排序数据异常，请刷新后重试');
      }
      return api.tags.reorder({ ids });
    },
    onSuccess: async () => {
      await invalidateTags();
      message.success('标签排序已更新');
    },
    onError: (error) => {
      setOrderedTags(tags);
      message.error(getApiErrorMessage(error));
    },
  });

  const updateSearch = async (values: TagListQuery) => {
    await navigate({ to: '/tags' as never, search: values as never });
  };

  const resetSearch = async () => {
    searchForm.resetFields();
    await navigate({ to: '/tags' as never, search: {} as never });
  };

  const openModal = (tag?: Tag) => {
    setEditingTag(tag ?? null);
    setModalOpen(true);
    form.setFieldsValue(tag ? { name: tag.name } : { name: '' });
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTag(null);
    form.resetFields();
  };

  const saveTag = async () => {
    saveMutation.mutate(await form.validateFields());
  };

  const sortTags = (items: Tag[]) => {
    setOrderedTags(items);
    reorderMutation.mutate(items);
  };

  const searchItems: SearchFormItem[] = [
    {
      type: 'input',
      name: 'keyword',
      label: '标签',
      placeholder: '搜索标签名称',
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
        onSearch={(values) => updateSearch(values as TagListQuery)}
        onReset={resetSearch}
      />

      <Card className="border border-(--card-border) bg-(--default-box-color) p-4 rounded-[calc(var(--custom-radius)/2+2px)]">
        <TableHeader
          left={
            canCreate ? (
              <Button type="primary" onClick={() => openModal()}>
                新建标签
              </Button>
            ) : null
          }
          loading={saveMutation.isPending}
          onRefresh={() => refetch()}
        />
        <SortableDataTable<Tag>
          rowKey="id"
          dataSource={orderedTags}
          disabled={
            !canEdit || Boolean(keyword) || reorderMutation.isPending || orderedTags.length < 2
          }
          pagination={false}
          onSortEnd={sortTags}
          columns={[
            {
              title: '标签名称',
              dataIndex: 'name',
              render: (_, item) => <AntTag color="blue">{item.name}</AntTag>,
            },
            { title: '顺序', width: 120, render: (_, __, index) => index + 1 },
            {
              title: '类型',
              width: 120,
              render: (_, item) =>
                item.isSystem ? <AntTag>系统</AntTag> : <AntTag color="green">自定义</AntTag>,
            },
            {
              title: '操作',
              width: 180,
              render: (_, item) =>
                canEdit || canDelete ? (
                  <Space>
                    {canEdit ? (
                      <Button type="link" onClick={() => openModal(item)}>
                        编辑
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <Popconfirm
                        title="删除标签"
                        description="删除后不会清理已写入菜谱的文本标签，确认继续？"
                        okText="删除"
                        okButtonProps={{ danger: true }}
                        cancelText="取消"
                        onConfirm={() => deleteMutation.mutate(item.id)}
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
        title={editingTag ? '编辑标签' : '新建标签'}
        open={modalOpen}
        width={480}
        destroyOnHidden
        okText="保存"
        cancelText="取消"
        confirmLoading={saveMutation.isPending}
        okButtonProps={{ disabled: editingTag ? !canEdit : !canCreate }}
        onCancel={closeModal}
        onOk={saveTag}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="标签名称"
            name="name"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input maxLength={32} placeholder="例如 快手菜" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
