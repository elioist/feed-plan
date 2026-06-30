import type { Category } from '@feed-plan/shared';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryListPage } from '~/pages/categories/CategoryListPage';
import { useAuthStore } from '~/store/modules/auth';

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
  reorderCategories: vi.fn(),
  updateCategory: vi.fn(),
}));

const antdAppMocks = vi.hoisted(() => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const routerMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  search: {},
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: reactQueryMocks.useMutation,
  useQueryClient: () => ({
    invalidateQueries: reactQueryMocks.invalidateQueries,
  }),
  useSuspenseQuery: reactQueryMocks.useSuspenseQuery,
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => routerMocks.navigate,
  useSearch: () => routerMocks.search,
}));

vi.mock('~/hooks/use-button-access', () => ({
  useCanButton: () => () => true,
}));

vi.mock('~/lib/api-client', () => ({
  api: {
    categories: {
      create: categoryApiMocks.createCategory,
      delete: categoryApiMocks.deleteCategory,
      reorder: categoryApiMocks.reorderCategories,
      update: categoryApiMocks.updateCategory,
    },
  },
}));
vi.mock('~/queries/categories', () => ({
  categoryQueries: categoryApiMocks.categoryQueries,
}));

vi.mock('~/components/core/tables', () => ({
  SortableDataTable: ({
    columns,
    dataSource,
  }: {
    columns: Array<{
      dataIndex?: keyof Category;
      render?: (value: unknown, record: Category, index: number) => React.ReactNode;
      title: React.ReactNode;
    }>;
    dataSource: Category[];
  }) => (
    <table>
      <tbody>
        {dataSource.map((record, index) => (
          <tr key={record.id}>
            {columns.map((column, columnIndex) => (
              <td key={String(column.dataIndex ?? columnIndex)}>
                {column.render
                  ? column.render(
                      column.dataIndex ? record[column.dataIndex] : undefined,
                      record,
                      index,
                    )
                  : column.dataIndex
                    ? String(record[column.dataIndex])
                    : null}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
  TableHeader: ({ left, onRefresh }: { left?: React.ReactNode; onRefresh?: () => void }) => (
    <div>
      {left}
      <button type="button" onClick={onRefresh}>
        刷新
      </button>
    </div>
  ),
}));

vi.mock('antd', async () => {
  const React = await import('react');
  type MockFormInstance = {
    values: Record<string, unknown>;
    resetFields: () => void;
    setFieldsValue: (values: Record<string, unknown>) => void;
    validateFields: () => Promise<Record<string, unknown>>;
  };
  const FormContext = React.createContext<MockFormInstance | null>(null);
  const createForm = (): MockFormInstance => ({
    values: {},
    resetFields() {
      this.values = {};
    },
    setFieldsValue(values) {
      this.values = { ...this.values, ...values };
    },
    async validateFields() {
      return this.values;
    },
  });
  const Form = Object.assign(
    ({
      children,
      form,
      initialValues,
    }: {
      children: React.ReactNode;
      form?: MockFormInstance;
      initialValues?: Record<string, unknown>;
    }) => {
      if (form && initialValues) {
        form.setFieldsValue(initialValues);
      }

      return <FormContext.Provider value={form ?? null}>{children}</FormContext.Provider>;
    },
    {
      Item: ({
        children,
        label,
        name,
      }: {
        children: React.ReactElement;
        label?: React.ReactNode;
        name?: string;
      }) => {
        const form = React.useContext(FormContext);
        const child = React.isValidElement(children)
          ? React.cloneElement(children, {
              'aria-label': typeof label === 'string' ? label : undefined,
              value: name && form ? String(form.values[name] ?? '') : undefined,
              onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                if (name && form) {
                  form.values = { ...form.values, [name]: event.target.value };
                }
                const childProps = children.props as {
                  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
                };
                childProps.onChange?.(event);
              },
            } as React.InputHTMLAttributes<HTMLInputElement>)
          : children;

        return label ? (
          <label>
            {label}
            {child}
          </label>
        ) : (
          child
        );
      },
      useForm: () => [createForm()],
    },
  );
  const Button = ({
    children,
    loading: _loading,
    type: _type,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; type?: string }) => (
    <button {...props} type="button">
      {children}
    </button>
  );
  const Input = Object.assign(
    (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
    {
      Search: (props: React.InputHTMLAttributes<HTMLInputElement> & { onSearch?: () => void }) => (
        <input {...props} />
      ),
    },
  );

  return {
    App: {
      useApp: () => ({ message: antdAppMocks.message }),
    },
    Button,
    Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Col: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DatePicker: Object.assign(
      (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
      {
        RangePicker: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
      },
    ),
    Form,
    Input,
    Modal: ({
      children,
      cancelText,
      okText,
      onCancel,
      onOk,
      open,
      title,
    }: {
      children: React.ReactNode;
      cancelText?: React.ReactNode;
      okText?: React.ReactNode;
      onCancel: () => void;
      onOk: () => void;
      open: boolean;
      title: React.ReactNode;
    }) =>
      open ? (
        <section aria-label={String(title)} role="dialog">
          {children}
          <button type="button" onClick={onCancel}>
            {cancelText ?? '取消'}
          </button>
          <button type="button" onClick={onOk}>
            {okText ?? '保存'}
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
    Row: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Select: (props: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...props} />,
    Space: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    Tag: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  };
});

describe('CategoryListPage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: 'test-token',
      user: {
        id: '11111111-1111-4111-8111-111111111111',
        username: 'test-admin',
        roles: [],
        actions: [],
        menuKeys: [],
        buttonKeys: [
          'recipes.categories.create',
          'recipes.categories.edit',
          'recipes.categories.delete',
        ],
      },
    });
    reactQueryMocks.invalidateQueries.mockReset();
    routerMocks.navigate.mockReset();
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
    categoryApiMocks.deleteCategory.mockResolvedValue({ ok: true });
    categoryApiMocks.reorderCategories.mockReset();
    categoryApiMocks.reorderCategories.mockResolvedValue({ ok: true });
    categoryApiMocks.updateCategory.mockReset();
    antdAppMocks.message.error.mockReset();
    antdAppMocks.message.success.mockReset();
  });

  it('renders the category list', async () => {
    render(<CategoryListPage />);

    expect(await screen.findByRole('button', { name: '新建分类' })).toBeInTheDocument();
    expect(await screen.findByText('家常菜')).toBeInTheDocument();
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

    await user.click(await screen.findByRole('button', { name: '新建分类' }));
    const dialog = await screen.findByRole('dialog', { name: '新建分类' });
    await user.type(within(dialog).getByLabelText('分类名称'), '新分类');
    await user.click(within(dialog).getByRole('button', { name: /保\s*存/ }));

    await waitFor(() => {
      expect(categoryApiMocks.createCategory).toHaveBeenCalledWith({
        name: '新分类',
        sortOrder: 12,
      });
    });
    expect(reactQueryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['categories'] });
    expect(antdAppMocks.message.success).toHaveBeenCalledWith('分类已创建');
  });

  it('deletes a category with confirmation and feedback', async () => {
    const user = userEvent.setup();

    render(<CategoryListPage />);

    await user.click((await screen.findAllByRole('button', { name: '确认删除' }))[0]!);

    await waitFor(() => {
      expect(categoryApiMocks.deleteCategory).toHaveBeenCalledWith(categories[0]!.id);
    });
    expect(reactQueryMocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['categories'] });
    expect(antdAppMocks.message.success).toHaveBeenCalledWith('分类已删除');
  });

  it('shows feedback when deleting a referenced category fails', async () => {
    const user = userEvent.setup();
    categoryApiMocks.deleteCategory.mockRejectedValue(new Error('category in use'));

    render(<CategoryListPage />);

    await user.click((await screen.findAllByRole('button', { name: '确认删除' }))[0]!);

    await waitFor(() => {
      expect(categoryApiMocks.deleteCategory).toHaveBeenCalledWith(categories[0]!.id);
    });
    expect(antdAppMocks.message.error).toHaveBeenCalledWith('category in use');
  });
});
