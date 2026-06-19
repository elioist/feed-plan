import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { describe, expect, it, vi } from 'vitest';
import type { DishListQuery } from '@feed-plan/shared';
import { DishSearchBar } from './DishSearchBar';

const categoryOptions = [{ label: '家常菜', value: '11111111-1111-1111-1111-111111111111' }];

function renderSearchBar(
  props: Partial<{
    searchParams: DishListQuery;
    onSearch: (values: DishListQuery) => void;
    onReset: () => void;
  }> = {},
) {
  const onSearch = props.onSearch ?? vi.fn();
  const onReset = props.onReset ?? vi.fn();

  function Wrapper() {
    const [form] = Form.useForm();
    return (
      <DishSearchBar
        form={form}
        searchParams={props.searchParams ?? {}}
        onSearch={onSearch}
        onReset={onReset}
        categoryOptions={categoryOptions}
      />
    );
  }

  render(<Wrapper />);
  return { onSearch, onReset };
}

describe('DishSearchBar', () => {
  it('提供搜索菜名、描述和菜谱内容的关键词输入框', () => {
    renderSearchBar();

    expect(screen.getByPlaceholderText('搜索菜名、描述或菜谱内容')).toBeInTheDocument();
  });

  it('输入关键词点击查询时回传 keyword', async () => {
    const user = userEvent.setup();
    const { onSearch } = renderSearchBar();

    await user.type(screen.getByPlaceholderText('搜索菜名、描述或菜谱内容'), '番茄');
    await user.click(screen.getByRole('button', { name: /查\s*询/ }));

    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({ keyword: '番茄' }));
  });
});
