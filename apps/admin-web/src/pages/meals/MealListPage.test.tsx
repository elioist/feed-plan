import type { MenuDetail } from '@feed-plan/shared';
import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MealListPage } from '~/pages/meals/MealListPage';

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
  invalidateQueries: vi.fn(),
  useMutation: vi.fn(),
  useSuspenseQuery: vi.fn(),
}));

const mealApiMocks = vi.hoisted(() => ({
  completeMeal: vi.fn(),
  mealQueries: {
    list: vi.fn((query: unknown) => ({ queryKey: ['meals', query] })),
  },
}));

const antdAppMocks = vi.hoisted(() => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@tanstack/react-query', () => ({
  queryOptions: (options: unknown) => options,
  useMutation: reactQueryMocks.useMutation,
  useQueryClient: () => ({
    invalidateQueries: reactQueryMocks.invalidateQueries,
  }),
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

vi.mock('~/api/meals', () => ({ completeMeal: mealApiMocks.completeMeal }));
vi.mock('~/queries/meals', () => ({ mealQueries: mealApiMocks.mealQueries }));

vi.mock('antd', async (importOriginal) => {
  const React = await import('react');
  const actual = await importOriginal<typeof import('antd')>();
  const toDateValue = (value: string) => ({ format: () => value });

  return {
    ...actual,
    App: {
      ...actual.App,
      useApp: () => ({ message: antdAppMocks.message }),
    },
    Popconfirm: ({ children, onConfirm }: { children: ReactNode; onConfirm: () => void }) => (
      <span>
        {children}
        <button type="button" onClick={onConfirm}>
          确认完成
        </button>
      </span>
    ),
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
    DatePicker: Object.assign(() => <input type="text" />, {
      RangePicker: ({
        onChange,
        placeholder = ['开始日期', '结束日期'],
      }: {
        onChange?: (value: unknown) => void;
        placeholder?: [string, string];
      }) => {
        const startRef = React.useRef('');
        const endRef = React.useRef('');
        const emitChange = () => {
          onChange?.([
            startRef.current ? toDateValue(startRef.current) : null,
            endRef.current ? toDateValue(endRef.current) : null,
          ]);
        };

        return (
          <span>
            <input
              aria-label="开始日期"
              placeholder={placeholder[0]}
              onChange={(event) => {
                startRef.current = event.target.value;
                emitChange();
              }}
            />
            <input
              aria-label="结束日期"
              placeholder={placeholder[1]}
              onChange={(event) => {
                endRef.current = event.target.value;
                emitChange();
              }}
            />
          </span>
        );
      },
    }),
  };
});

describe('MealListPage', () => {
  beforeEach(() => {
    reactQueryMocks.invalidateQueries.mockReset();
    reactQueryMocks.useMutation.mockImplementation((options) => ({
      isPending: false,
      mutate: async (id: string) => {
        try {
          await options.mutationFn(id);
          await options.onSuccess?.(undefined, id, undefined);
        } catch (error) {
          options.onError?.(error, id, undefined);
        }
      },
    }));
    routerMocks.navigate.mockReset();
    routerMocks.search = {};
    reactQueryMocks.useSuspenseQuery.mockReturnValue({ data: menuDetails });
    mealApiMocks.completeMeal.mockReset();
    mealApiMocks.completeMeal.mockResolvedValue({
      ...menuDetails[0],
      meal: { ...menuDetails[0]!.meal, status: 'completed' },
    });
    mealApiMocks.mealQueries.list.mockClear();
    antdAppMocks.message.error.mockReset();
    antdAppMocks.message.success.mockReset();
  });

  it('renders today menu data', () => {
    render(<MealListPage />);

    expect(screen.getByLabelText('开始日期')).toBeInTheDocument();
    expect(screen.getByLabelText('结束日期')).toBeInTheDocument();
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

    await user.type(screen.getByLabelText('开始日期'), '2026-06-01');
    await user.type(screen.getByLabelText('结束日期'), '2026-06-19');
    await user.selectOptions(screen.getByLabelText('餐型'), 'dinner');
    await user.selectOptions(screen.getByLabelText('状态'), 'ordering');
    await user.click(screen.getByRole('button', { name: /查\s*询/ }));

    await waitFor(() => {
      expect(routerMocks.navigate).toHaveBeenCalledWith({
        search: {
          mealDateFrom: '2026-06-01',
          mealDateTo: '2026-06-19',
          mealType: 'dinner',
          status: 'ordering',
        },
        to: '/meals',
      });
    });
  });

  it('completes ordering meals from the list with confirmation', async () => {
    const user = userEvent.setup();
    render(<MealListPage />);

    await user.click(screen.getByRole('button', { name: '确认完成' }));

    await waitFor(() => {
      expect(mealApiMocks.completeMeal).toHaveBeenCalledWith(menuDetails[0]!.meal.id);
    });
    expect(reactQueryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['meals'] });
    expect(antdAppMocks.message.success).toHaveBeenCalledWith('本次点餐已完成');
  });
});
