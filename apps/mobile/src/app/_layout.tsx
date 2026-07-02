import '../../global.css';

import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '~/stores/auth-store';
import { AppProviders } from '~/providers';
import { initializeDayjs } from '~/initialize/dayjs';

const PUBLIC_ROUTES = ['login'];

initializeDayjs();

function RootLayoutNav() {
  const { isAuthenticated, isLoading, restoreSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const currentRoute = segments[0] ?? '';
    const isPublicRoute = PUBLIC_ROUTES.includes(currentRoute);

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/login');
    } else if (isAuthenticated && isPublicRoute) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="auto" />
      <RootLayoutNav />
    </AppProviders>
  );
}
