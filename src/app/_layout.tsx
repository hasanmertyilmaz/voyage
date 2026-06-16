import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineBanner } from '@/components/OfflineBanner';
import { supabase } from '@/services/supabase';
import { store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  restoreSession,
  selectAuthStatus,
  selectIsAuthenticated,
  sessionChanged,
} from '@/store/slices/authSlice';
import { clearEntries } from '@/store/slices/entriesSlice';
import { loadSettings } from '@/store/slices/settingsSlice';
import { ThemeProvider, useThemeContext } from '@/theme/theme-context';

function RootNavigator() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const segments = useSegments();
  const router = useRouter();
  const { isDark } = useThemeContext();

  // Bootstrap once: load saved settings, restore the session, and keep Redux in
  // sync with Supabase auth changes (token refresh / external sign-out).
  useEffect(() => {
    dispatch(loadSettings());
    dispatch(restoreSession());
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(
        sessionChanged(
          session?.user ? { id: session.user.id, email: session.user.email ?? null } : null,
        ),
      );
      if (!session) dispatch(clearEntries());
    });
    return () => data.subscription.unsubscribe();
  }, [dispatch]);

  // Auth gate — redirect based on session state and the active route group.
  useEffect(() => {
    if (status === 'initializing') return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [status, isAuthenticated, segments, router]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="entry/[id]"
          options={{ headerShown: true, title: 'Trip', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="modal/new"
          options={{ presentation: 'modal', headerShown: true, title: 'New trip' }}
        />
        <Stack.Screen
          name="modal/edit/[id]"
          options={{ presentation: 'modal', headerShown: true, title: 'Edit trip' }}
        />
      </Stack>
      <OfflineBanner />
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <ErrorBoundary>
              <RootNavigator />
            </ErrorBoundary>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
