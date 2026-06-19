import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginPage } from '../pages/login/LoginPage.js';
import { useAuthStore } from '../features/auth/store.js';

export const Route = createFileRoute('/login')({
  validateSearch: (search) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated()) {
      throw redirect({ to: '/' });
    }
  },
  component: LoginPage,
});
