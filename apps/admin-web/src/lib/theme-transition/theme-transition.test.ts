import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runThemeTransition } from './index';

const originalStartViewTransition = document.startViewTransition;

function defineStartViewTransition(value: Document['startViewTransition']) {
  Object.defineProperty(document, 'startViewTransition', {
    configurable: true,
    value,
  });
}

describe('runThemeTransition', () => {
  beforeEach(() => {
    document.documentElement.style.removeProperty('--theme-transition-x');
    document.documentElement.style.removeProperty('--theme-transition-y');
    document.documentElement.style.removeProperty('--theme-transition-radius');
    vi.mocked(window.matchMedia).mockReturnValue({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    });
  });

  afterEach(() => {
    defineStartViewTransition(originalStartViewTransition);
  });

  it('runs theme updates inside a view transition from the click position', () => {
    const updateTheme = vi.fn();
    const startViewTransition = vi.fn((callback: ViewTransitionUpdateCallback) => {
      void callback();
      return {} as ViewTransition;
    });
    defineStartViewTransition(startViewTransition);

    runThemeTransition(updateTheme, { clientX: 24, clientY: 32 });

    expect(startViewTransition).toHaveBeenCalledOnce();
    expect(updateTheme).toHaveBeenCalledOnce();
    expect(document.documentElement.style.getPropertyValue('--theme-transition-x')).toBe('24px');
    expect(document.documentElement.style.getPropertyValue('--theme-transition-y')).toBe('32px');
    expect(document.documentElement.style.getPropertyValue('--theme-transition-radius')).not.toBe('');
  });

  it('falls back to a direct update when reduced motion is preferred', () => {
    const updateTheme = vi.fn();
    const startViewTransition = vi.fn();
    defineStartViewTransition(startViewTransition as unknown as Document['startViewTransition']);
    vi.mocked(window.matchMedia).mockReturnValue({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    });

    runThemeTransition(updateTheme, { clientX: 24, clientY: 32 });

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(updateTheme).toHaveBeenCalledOnce();
  });
});
