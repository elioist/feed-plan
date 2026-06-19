import type { MenuDetail } from '@feed-plan/shared';
import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MealListPage } from './MealListPage';

const menuDetails: MenuDetail[] = [
  {
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
        quantities: [],
      },
    ],
  },
];

const routerMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  search: {},
}));

const reactQueryMocks = vi.hoisted(() => ({
  useSuspenseQuery: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  queryOptions: (options: unknown) => options,
  useSuspenseQuery: reactQueryMocks.useSuspenseQuery,
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    params,
    to,
  }: {
    children: ReactNode;
    params?: Record<string, string>;
    to: string;
  }) => <a href={params?.mealId ? '/meals/' + params.mealId : to}>{children}</a>,
  useNavigate: () => routerMocks.navigate,
  useSearch: () => routerMocks.search,
}));

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    Select: ({
      id,
      onChange,
      options = [],
      placeholder,
      value,
    }: {
      id?: string;
      onChange?: (value: string) => void;
      options?: { label: string; value: string }[];
      placeholder?: string;
      value?: string;
    }) => (
      <select
        aria-label={placeholder}
        id={id}
        value={value ?? ''}
        onChange={(event) => onChange?.(event.target.value)}
      >
        <option value="">全部</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ),
  };
});

describe('MealListPage', () => {
  beforeEach(() => {
    routerMocks.navigate.mockReset();
    routerMocks.search = {};
    reactQueryMocks.useSuspenseQuery.mockReturnValue({ data: menuDetails });
  });

  it('renders today menu data', () => {
    render(<MealListPage />);

    expect(screen.getByRole('heading', { name: '点菜菜单' })).toBeInTheDocument();
    expect(screen.getByText('今日晚餐')).toBeInTheDocument();
    expect(screen.getByText('2026-06-19')).toBeInTheDocument();
    expect(screen.getAllByText('点菜中').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: '查看' })).toHaveAttribute(
      'href',
      '/meals/11111111-1111-1111-1111-111111111111',
    );
  });

  it('submits filters through URL search', async () => {
    const user = userEvent.setup();
    render(<MealListPage />);

    await user.type(screen.getByPlaceholderText('日期 YYYY-MM-DD'), '2026-06-19');
    await user.selectOptions(screen.getByLabelText('餐型'), 'dinner');
    await user.selectOptions(screen.getByLabelText('状态'), 'ordering');
    await user.click(screen.getByRole('button', { name: /查\s*询/ }));

    await waitFor(() => {
      expect(routerMocks.navigate).toHaveBeenCalledWith({
        search: {
          mealDate: '2026-06-19',
          mealType: 'dinner',
          status: 'ordering',
        },
        to: '/meals',
      });
    });
  });
});
