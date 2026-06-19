import type { MenuDetail } from '@feed-plan/shared';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MealDetailPage } from './MealDetailPage';

const menuDetail: MenuDetail = {
  meal: {
    id: '11111111-1111-1111-1111-111111111111',
    title: '今日晚餐',
    mealDate: '2026-06-19',
    mealType: 'dinner',
    type: 'daily',
    status: 'ordering',
    createdBy: '22222222-2222-2222-2222-222222222222',
    createdAt: new Date('2026-06-19T10:00:00.000Z'),
    completedAt: null,
  },
  orders: [],
  items: [
    {
      dish: {
        id: '33333333-3333-3333-3333-333333333333',
        name: '番茄炒蛋',
        categoryId: '44444444-4444-4444-4444-444444444444',
        category: null,
        coverImage: null,
        description: null,
        referenceUrl: null,
        difficulty: 'easy',
        isActive: true,
        createdAt: new Date('2026-06-18T00:00:00.000Z'),
        updatedAt: new Date('2026-06-18T00:00:00.000Z'),
      },
      totalQuantity: 2,
      quantities: [{ userId: null, username: 'chef', guestName: null, quantity: 2 }],
    },
  ],
};

const reactQueryMocks = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  useMutation: vi.fn(),
  useSuspenseQuery: vi.fn(),
}));

const mealApiMocks = vi.hoisted(() => ({
  completeMeal: vi.fn(),
  mealQueries: {
    detail: vi.fn((id: string) => ({ queryKey: ['meals', id] })),
  },
}));

const antdAppMocks = vi.hoisted(() => ({
  message: {
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

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ mealId: menuDetail.meal.id }),
}));

vi.mock('../../features/meals/api.js', () => mealApiMocks);

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    App: {
      ...actual.App,
      useApp: () => ({ message: antdAppMocks.message }),
    },
  };
});

describe('MealDetailPage', () => {
  beforeEach(() => {
    reactQueryMocks.invalidateQueries.mockReset();
    reactQueryMocks.useSuspenseQuery.mockReturnValue({ data: menuDetail });
    reactQueryMocks.useMutation.mockImplementation((options) => ({
      isPending: false,
      mutate: async (id: string) => {
        await options.mutationFn(id);
        await options.onSuccess?.(undefined, id, undefined);
      },
    }));
    mealApiMocks.completeMeal.mockReset();
    mealApiMocks.completeMeal.mockResolvedValue({
      ...menuDetail,
      meal: { ...menuDetail.meal, status: 'completed' },
    });
    mealApiMocks.mealQueries.detail.mockClear();
    antdAppMocks.message.success.mockReset();
  });

  it('renders meal detail and completes ordering meals', async () => {
    const user = userEvent.setup();
    render(<MealDetailPage />);

    expect(screen.getByText('今日晚餐')).toBeInTheDocument();
    expect(screen.getByText('点菜中')).toBeInTheDocument();
    expect(screen.getByText('番茄炒蛋')).toBeInTheDocument();
    expect(screen.getByText('chef')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '完成本次点餐' }));

    await waitFor(() => {
      expect(mealApiMocks.completeMeal).toHaveBeenCalledWith(menuDetail.meal.id);
    });
    expect(reactQueryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['meals'] });
    expect(antdAppMocks.message.success).toHaveBeenCalledWith('本次点餐已完成');
  });
});
