import type { Category } from '@feed-plan/shared';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DishForm } from './DishForm';

const categories: Category[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: '家常菜',
    sortOrder: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
];

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    Select: ({
      id,
      onChange,
      options = [],
      value,
    }: {
      id?: string;
      onChange?: (value: string) => void;
      options?: { label: string; value: string }[];
      value?: string;
    }) => (
      <select id={id} value={value ?? ''} onChange={(event) => onChange?.(event.target.value)}>
        <option value="">请选择</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ),
  };
});

vi.mock('./CoverImageUpload.js', () => ({
  CoverImageUpload: ({
    onChange,
    value,
  }: {
    onChange?: (value: string | null) => void;
    value?: string | null;
  }) => (
    <input
      aria-label="封面图上传"
      value={value ?? ''}
      onChange={(event) => onChange?.(event.target.value || null)}
    />
  ),
}));

describe('DishForm', () => {
  beforeEach(() => {
    vi.stubGlobal('document', document);
    document.execCommand = vi.fn();
  });

  it('shows required validation for missing base fields', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<DishForm categories={categories} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /保\s*存/ }));

    expect(await screen.findByText('请输入菜名')).toBeInTheDocument();
    expect(screen.getByText('请选择分类')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits edited rich recipe content in the payload', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<DishForm categories={categories} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('菜名'), '番茄炒蛋');
    await user.selectOptions(screen.getByLabelText('分类'), categories[0]!.id);
    await user.selectOptions(screen.getByLabelText('难度'), 'medium');
    await user.type(screen.getByLabelText('封面图上传'), '/uploads/tomato.webp');
    await user.type(screen.getByLabelText('参考链接'), 'https://example.com/recipe');
    await user.type(screen.getByLabelText('描述'), '酸甜下饭');

    const editor = screen.getByRole('textbox', { name: '菜谱内容' });
    editor.innerHTML = '<h3>食材</h3><p>番茄、鸡蛋</p><h3>做法</h3><p>炒熟</p>';
    fireEvent.input(editor);

    await user.click(screen.getByRole('button', { name: /保\s*存/ }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryIds: [categories[0]!.id],
          coverImage: '/uploads/tomato.webp',
          description: '酸甜下饭',
          difficulty: 'medium',
          isActive: true,
          name: '番茄炒蛋',
          recipeContent: '<h3>食材</h3><p>番茄、鸡蛋</p><h3>做法</h3><p>炒熟</p>',
          referenceUrl: 'https://example.com/recipe',
        }),
      );
    });
  });
});
