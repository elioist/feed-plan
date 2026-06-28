import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RouteTransition } from './index';
import { useSettingStore } from '~/store/modules/setting';

const routerState = vi.hoisted(() => ({ pathname: '/dishes' }));
const motionState = vi.hoisted(() => ({ reducedMotion: false }));

vi.mock('@tanstack/react-router', () => ({
  useRouterState: vi.fn(({ select }) => select({ location: { pathname: routerState.pathname } })),
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({
      children,
      initial,
      ...props
    }: {
      children: ReactNode;
      initial?: Record<string, unknown> | false;
      [key: string]: unknown;
    }) => (
      <div data-has-y={String(Boolean(initial && initial.y))} {...props}>
        {children}
      </div>
    ),
  },
  useReducedMotion: () => motionState.reducedMotion,
}));

describe('RouteTransition', () => {
  beforeEach(() => {
    routerState.pathname = '/dishes';
    motionState.reducedMotion = false;
    useSettingStore.setState({ pageTransition: 'fade' });
  });

  it('renders a motion view for enabled page transitions', () => {
    render(<RouteTransition refreshToken={0}>菜品管理</RouteTransition>);

    expect(screen.getByText('菜品管理').getAttribute('data-page-transition')).toBe('fade');
  });

  it('renders a static view when page transition is disabled', () => {
    useSettingStore.setState({ pageTransition: '' });

    render(<RouteTransition refreshToken={0}>菜品管理</RouteTransition>);

    expect(screen.getByText('菜品管理').getAttribute('data-page-transition')).toBe('none');
  });

  it('uses reduced motion variants when the user prefers less motion', () => {
    motionState.reducedMotion = true;
    useSettingStore.setState({ pageTransition: 'slide-bottom' });

    render(<RouteTransition refreshToken={0}>菜品管理</RouteTransition>);

    expect(screen.getByText('菜品管理').getAttribute('data-has-y')).toBe('false');
  });
});
