import { SearchBar, type SearchFormItem } from '~/components/core/search';
import type { MealQuery } from '@feed-plan/shared';
import type { FormInstance } from 'antd';
import type { Dayjs } from 'dayjs';

export type MealSearchFormValues = Omit<MealQuery, 'mealDate'> & {
  mealDateRange?: [Dayjs, Dayjs] | null;
};

interface MealSearchBarProps {
  /** 表单实例 */
  form: FormInstance<MealSearchFormValues>;
  /** 搜索参数 */
  searchParams: MealSearchFormValues;
  /** 查询回调 */
  onSearch: (values: MealSearchFormValues) => void;
  /** 重置回调 */
  onReset: () => void;
}

export function MealSearchBar({
  form,
  searchParams,
  onSearch,
  onReset,
}: MealSearchBarProps) {
  const items: SearchFormItem[] = [
    {
      type: 'dateRange',
      name: 'mealDateRange',
      label: '日期',
      placeholder: ['开始日期', '结束日期'],
      width: '100%',
      span: 8,
    },
    {
      type: 'select',
      name: 'mealType',
      label: '餐型',
      placeholder: '请选择餐型',
      width: 140,
      span: 5,
      options: [
        { label: '早餐', value: 'breakfast' },
        { label: '午餐', value: 'lunch' },
        { label: '晚餐', value: 'dinner' },
      ],
    },
    {
      type: 'select',
      name: 'status',
      label: '状态',
      placeholder: '请选择状态',
      width: 140,
      span: 5,
      options: [
        { label: '点菜中', value: 'ordering' },
        { label: '已完成', value: 'completed' },
      ],
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
