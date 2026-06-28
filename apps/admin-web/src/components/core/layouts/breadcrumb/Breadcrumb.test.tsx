import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Breadcrumb } from './index';
import type { AdminMenuItem } from '~/routes/core/menu-processor';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

const menus: AdminMenuItem[] = [
  {
    children: [
      {
        children: [],
        icon: null,
        key: 'recipes.dishes',
        label: '菜品管理',
        path: '/dishes',
        type: 'page',
      },
    ],
    icon: null,
    key: 'recipes',
    label: '菜谱管理',
    type: 'directory',
  },
];

describe('Breadcrumb', () => {
  it('renders the matched menu trail without an extra admin root label', () => {
    render(<Breadcrumb fallbackTitle="页面" menus={menus} pathname="/dishes" />);

    expect(screen.queryByText('后台')).toBeNull();
    expect(screen.getByText('菜谱管理')).toBeTruthy();
    expect(screen.getByText('菜品管理')).toBeTruthy();
  });
});
