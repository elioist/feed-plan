import { createFileRoute, redirect } from '@tanstack/react-router';
import { SettingsPage } from '~/pages/settings/SettingsPage';
import { useAuthStore } from '~/store/modules/auth';

export const Route = createFileRoute('/_authenticated/settings')({
  beforeLoad: async () => {
    await useAuthStore.getState().restoreSession();
    if (useAuthStore.getState().user?.role !== 'chef') {
      throw redirect({ to: '/' });
    }
  },
  component: SettingsPage,
});
