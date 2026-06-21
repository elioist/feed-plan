import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SvgIcon } from '~/components/core/base/svg-icon';

vi.mock('@iconify/react', () => ({
  Icon: ({ icon, className }: { icon: string; className?: string }) => (
    <span className={className} data-icon={icon} data-testid="iconify" />
  ),
}));

describe('SvgIcon', () => {
  it('renders nothing when icon is not provided', () => {
    const { container } = render(<SvgIcon />);

    expect(container.firstChild).toBeNull();
  });

  it('renders the iconify icon and merges class names', () => {
    render(<SvgIcon className="text-lg" icon="ri:arrow-up-wide-line" />);

    const icon = screen.getByTestId('iconify');
    expect(icon).toHaveAttribute('data-icon', 'ri:arrow-up-wide-line');
    expect(icon).toHaveClass('art-svg-icon', 'inline', 'text-lg');
  });
});
