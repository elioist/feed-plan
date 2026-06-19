import { SearchBar, type SearchFormItem } from '~/components/core/search';
import type { DishListQuery } from '@feed-plan/shared';
import type { FormInstance } from 'antd';

interface DishSearchBarProps {
  /** 表单实例 */
  form: FormInstance;
  /** 搜索参数 */
  searchParams: DishListQuery;
  /** 查询回调 */
  onSearch: (values: DishListQuery) => void;
  /** 重置回调 */
  onReset: () => void;
  /** 分类选项 */
  categoryOptions: Array<{ label: string; value: string }>;
}

export function DishSearchBar({
  form,
  searchParams,
  onSearch,
  onReset,
  categoryOptions,
}: DishSearchBarProps) {
  const items: SearchFormItem[] = [
    {
      type: 'input',
      name: 'keyword',
      label: '关键词',
      placeholder: '搜索菜名、描述或菜谱内容',
    },
    {
      type: 'select',
      name: 'categoryId',
      label: '分类',
      placeholder: '请选择分类',
      options: categoryOptions,
    },
    {
      type: 'select',
      name: 'isActive',
      label: '状态',
      placeholder: '请选择状态',
      width: 140,
      options: [
        { label: '启用', value: true },
        { label: '停用', value: false },
      ],
    },
    {
      type: 'select',
      name: 'difficulty',
      label: '难度',
      placeholder: '请选择难度',
      width: 140,
      options: [
        { label: '简单', value: 'easy' },
        { label: '中等', value: 'medium' },
        { label: '困难', value: 'hard' },
      ],
    },
    {
      type: 'input',
      name: 'tag',
      label: '标签',
      placeholder: '按标签筛选',
    },
    {
      type: 'input',
      name: 'dietary',
      label: '忌口',
      placeholder: '按忌口筛选',
    },
    {
      type: 'input',
      name: 'createdBy',
      label: '创建人',
      placeholder: '请输入创建人',
    },
  ];

  return (
    <SearchBar
      form={form}
      items={items}
      onSearch={onSearch}
      onReset={onReset}
      initialValues={searchParams}
    />
  );
}
