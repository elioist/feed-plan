import type { Category, DishSummary } from '@feed-plan/shared';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DishListPage } from '~/pages/dishes/DishListPage';

const categories: Category[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: '家常菜',
    sortOrder: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
];

const dishes: DishSummary[] = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: '番茄炒蛋',
    categoryId: categories[0]!.id,
    category: categories[0]!,
    coverImage: null,
    description: '家常快手菜',
    referenceUrl: null,
    difficulty: 'easy',
    isActive: true,
    createdAt: new Date('2026-01-02T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  },
];

const routerMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  search: {},
}));

const reactQueryMocks = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  useMutation: vi.fn(),
  useQuery: vi.fn(),
  useSuspenseQuery: vi.fn(),
}));

const dishApiMocks = vi.hoisted(() => ({
  createDish: vi.fn(),
  deleteDish: vi.fn(),
  dishQueries: {
    detail: vi.fn((id: string) => ({ queryKey: ['dishes', id] })),
    list: vi.fn((query: unknown) => ({ queryKey: ['dishes', query] })),
  },
  setDishActive: vi.fn(),
  updateDish: vi.fn(),
}));

const categoryApiMocks = vi.hoisted(() => ({
  categoryQueries: {
    all: vi.fn(() => ({ queryKey: ['categories'] })),
  },
}));

const antdAppMocks = vi.hoisted(() => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: reactQueryMocks.useMutation,
  useQuery: reactQueryMocks.useQuery,
  useQueryClient: () => ({
    invalidateQueries: reactQueryMocks.invalidateQueries,
  }),
  useSuspenseQuery: reactQueryMocks.useSuspenseQuery,
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => routerMocks.navigate,
  useSearch: () => routerMocks.search,
}));

vi.mock('~/api/dishes', () => ({
  createDish: dishApiMocks.createDish,
  deleteDish: dishApiMocks.deleteDish,
  setDishActive: dishApiMocks.setDishActive,
  updateDish: dishApiMocks.updateDish,
}));
vi.mock('~/queries/dishes', () => ({ dishQueries: dishApiMocks.dishQueries }));
vi.mock('~/queries/categories', () => categoryApiMocks);

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    App: {
      ...actual.App,
      useApp: () => ({ message: antdAppMocks.message }),
    },
    Popconfirm: ({
      children,
      onConfirm,
      title,
    }: {
      children: React.ReactNode;
      onConfirm: () => void;
      title: React.ReactNode;
    }) => {
      const action = String(title).replace('菜谱', '');
      return (
        <span>
          {children}
          <button type="button" onClick={onConfirm}>
            确认{action}
          </button>
        </span>
      );
    },
  };
});

describe('DishListPage', () => {
  beforeEach(() => {
    routerMocks.navigate.mockReset();
    routerMocks.search = {};
    reactQueryMocks.invalidateQueries.mockReset();
    reactQueryMocks.useQuery.mockReturnValue({ data: undefined, isFetching: false });
    reactQueryMocks.useSuspenseQuery.mockImplementation((options) => {
      if (options.queryKey[0] === 'categories') {
        return { data: categories };
      }
      return { data: dishes };
    });
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

    dishApiMocks.createDish.mockReset();
    dishApiMocks.deleteDish.mockReset();
    dishApiMocks.deleteDish.mockResolvedValue({ ok: true });
    dishApiMocks.dishQueries.detail.mockClear();
    dishApiMocks.dishQueries.list.mockClear();
    dishApiMocks.setDishActive.mockReset();
    dishApiMocks.updateDish.mockReset();
    categoryApiMocks.categoryQueries.all.mockClear();
    antdAppMocks.message.error.mockReset();
    antdAppMocks.message.success.mockReset();
  });

  it('loads active dishes by default', () => {
    render(<DishListPage />);

    expect(dishApiMocks.dishQueries.list).toHaveBeenCalledWith({ isActive: true });
  });

  it('keeps the default active filter out of the URL when searching', async () => {
    const user = userEvent.setup();
    render(<DishListPage />);

    await user.click(screen.getByRole('button', { name: /查\s*询/ }));

    await waitFor(() => {
      expect(routerMocks.navigate).toHaveBeenCalledWith({ to: '/dishes', search: {} });
    });
  });

  it('clears dish filters without writing default active state to the URL', async () => {
    const user = userEvent.setup();
    render(<DishListPage />);

    await user.click(screen.getByRole('button', { name: /重\s*置/ }));

    await waitFor(() => {
      expect(routerMocks.navigate).toHaveBeenCalledWith({ to: '/dishes', search: {} });
    });
  });

  it('deletes active dishes with confirmation and feedback', async () => {
    const user = userEvent.setup();
    render(<DishListPage />);

    expect(screen.getByRole('button', { name: '新建菜谱' })).toBeInTheDocument();
    expect(screen.getByText('番茄炒蛋')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '确认删除' }));

    await waitFor(() => {
      expect(dishApiMocks.deleteDish).toHaveBeenCalledWith(dishes[0]!.id);
    });
    expect(reactQueryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['dishes'] });
    expect(antdAppMocks.message.success).toHaveBeenCalledWith('菜谱已删除');
  });

  it('toggles active dishes from the status column with confirmation', async () => {
    const user = userEvent.setup();
    render(<DishListPage />);

    await user.click(screen.getByRole('button', { name: '确认停用' }));

    await waitFor(() => {
      expect(dishApiMocks.setDishActive).toHaveBeenCalledWith(dishes[0]!.id, {
        isActive: false,
      });
    });
    expect(antdAppMocks.message.success).toHaveBeenCalledWith('菜谱状态已更新');
  });
});
