import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BackToTop } from '~/components/core/base/back-to-top';

vi.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <span data-icon={icon} data-testid="iconify" />,
}));

function createScrollContainer() {
  const container = document.createElement('div');
  container.id = 'app-main';
  container.scrollTo = vi.fn();
  document.body.appendChild(container);
  return container;
}

function setScrollTop(container: HTMLElement, value: number) {
  Object.defineProperty(container, 'scrollTop', { configurable: true, value });
  fireEvent.scroll(container);
}

describe('BackToTop', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = createScrollContainer();
  });

  afterEach(() => {
    container.remove();
  });

  it('stays hidden until the scroll passes the threshold', () => {
    render(<BackToTop targetId="app-main" threshold={300} />);

    const button = screen.getByRole('button', { name: '返回顶部' });
    expect(button).toHaveClass('opacity-0', 'pointer-events-none');

    setScrollTop(container, 301);
    expect(button).toHaveClass('opacity-100', 'pointer-events-auto');

    setScrollTop(container, 100);
    expect(button).toHaveClass('opacity-0', 'pointer-events-none');
  });

  it('smoothly scrolls the container to the top on click', () => {
    render(<BackToTop targetId="app-main" />);

    fireEvent.click(screen.getByRole('button', { name: '返回顶部' }));

    expect(container.scrollTo).toHaveBeenCalledWith({ behavior: 'smooth', top: 0 });
  });

  it('renders without crashing when the target container is missing', () => {
    render(<BackToTop targetId="missing-container" />);

    const button = screen.getByRole('button', { name: '返回顶部' });
    expect(button).toHaveClass('opacity-0');
  });
});
