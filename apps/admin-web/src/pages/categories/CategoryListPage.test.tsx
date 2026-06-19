import type { Category } from '@feed-plan/shared';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryListPage } from '~/pages/categories/CategoryListPage';

const categories: Category[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: '家常菜',
    sortOrder: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: '汤',
    sortOrder: 2,
    createdAt: new Date('2026-01-02T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  },
];

const reactQueryMocks = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  useMutation: vi.fn(),
  useSuspenseQuery: vi.fn(),
}));

const categoryApiMocks = vi.hoisted(() => ({
  categoryQueries: {
    all: vi.fn(() => ({ queryKey: ['categories'] })),
  },
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
  updateCategory: vi.fn(),
}));

const antdAppMocks = vi.hoisted(() => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: reactQueryMocks.useMutation,
  useQueryClient: () => ({
    invalidateQueries: reactQueryMocks.invalidateQueries,
  }),
  useSuspenseQuery: reactQueryMocks.useSuspenseQuery,
}));

vi.mock('../../features/categories/api.js', () => categoryApiMocks);

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    App: {
      ...actual.App,
      useApp: () => ({ message: antdAppMocks.message }),
    },
    Modal: ({
      children,
      onCancel,
      onOk,
      open,
      title,
    }: {
      children: React.ReactNode;
      onCancel: () => void;
      onOk: () => void;
      open: boolean;
      title: React.ReactNode;
    }) =>
      open ? (
        <section aria-label={String(title)} role="dialog">
          {children}
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" onClick={onOk}>
            OK
          </button>
        </section>
      ) : null,
    Popconfirm: ({ children, onConfirm }: { children: React.ReactNode; onConfirm: () => void }) => (
      <span>
        {children}
        <button type="button" onClick={onConfirm}>
          确认删除
        </button>
      </span>
    ),
  };
});

describe('CategoryListPage', () => {
  beforeEach(() => {
    reactQueryMocks.invalidateQueries.mockReset();
    reactQueryMocks.useSuspenseQuery.mockReturnValue({ data: categories });
    reactQueryMocks.useMutation.mockImplementation((options) => ({
      isPending: false,
      mutate: async (input: unknown) => {
        try {
          await options.mutationFn(input);
          await options.onSuccess?.(undefined, input, undefined);
        } catch (error) {
          options.onError?.(error, input, undefined);
        }
      },
    }));

    categoryApiMocks.categoryQueries.all.mockClear();
    categoryApiMocks.createCategory.mockReset();
    categoryApiMocks.deleteCategory.mockReset();
    categoryApiMocks.updateCategory.mockReset();
    antdAppMocks.message.error.mockReset();
    antdAppMocks.message.success.mockReset();
  });

  it('renders the category list', () => {
    render(<CategoryListPage />);

    expect(screen.getByRole('heading', { name: '分类管理' })).toBeInTheDocument();
    expect(screen.getByText('家常菜')).toBeInTheDocument();
    expect(screen.getByText('汤')).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('creates a category and shows success feedback', async () => {
    const user = userEvent.setup();
    categoryApiMocks.createCategory.mockResolvedValue({
      ...categories[0],
      id: '33333333-3333-3333-3333-333333333333',
      name: '新分类',
      sortOrder: 3,
    });

    render(<CategoryListPage />);

    await user.click(screen.getByRole('button', { name: '新建分类' }));
    const dialog = await screen.findByRole('dialog', { name: '新建分类' });
    await user.type(within(dialog).getByLabelText('分类名称'), '新分类');
    await user.clear(within(dialog).getByLabelText('排序值'));
    await user.type(within(dialog).getByLabelText('排序值'), '3');
    await user.click(within(dialog).getByRole('button', { name: 'OK' }));

    await waitFor(() => {
      expect(categoryApiMocks.createCategory).toHaveBeenCalledWith({
        name: '新分类',
        sortOrder: 3,
      });
    });
    expect(reactQueryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['categories'] });
    expect(antdAppMocks.message.success).toHaveBeenCalledWith('分类已创建');
  });

  it('shows feedback when deleting a referenced category fails', async () => {
    const user = userEvent.setup();
    categoryApiMocks.deleteCategory.mockRejectedValue(new Error('category in use'));

    render(<CategoryListPage />);

    await user.click(screen.getAllByRole('button', { name: '确认删除' })[0]!);

    await waitFor(() => {
      expect(categoryApiMocks.deleteCategory).toHaveBeenCalledWith(categories[0]!.id);
    });
    expect(antdAppMocks.message.error).toHaveBeenCalledWith('删除失败，可能仍有菜谱引用该分类');
  });
});
