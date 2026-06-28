import { flushSync } from 'react-dom';

type ThemeTransitionEvent = Pick<MouseEvent, 'clientX' | 'clientY'>;

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function setTransitionOrigin(event?: ThemeTransitionEvent) {
  const x = event?.clientX ?? window.innerWidth / 2;
  const y = event?.clientY ?? window.innerHeight / 2;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const root = document.documentElement;

  root.style.setProperty('--theme-transition-x', `${x}px`);
  root.style.setProperty('--theme-transition-y', `${y}px`);
  root.style.setProperty('--theme-transition-radius', `${radius}px`);
}

export function runThemeTransition(updateTheme: () => void, event?: ThemeTransitionEvent) {
  if (!document.startViewTransition || prefersReducedMotion()) {
    updateTheme();
    return;
  }

  setTransitionOrigin(event);

  document.startViewTransition(() => {
    flushSync(updateTheme);
  });
}
