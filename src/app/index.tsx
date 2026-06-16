import { Redirect } from 'expo-router';

import { Loading } from '@/components/ui/Loading';
import { Screen } from '@/components/ui/Screen';
import { useAppSelector } from '@/store/hooks';
import { selectAuthStatus, selectIsAuthenticated } from '@/store/slices/authSlice';

/**
 * Entry route. While the persisted session is being restored it shows the
 * splash; once resolved it sends the user to the tabs (signed in) or to the
 * login screen (signed out).
 */
export default function IndexScreen() {
  const status = useAppSelector(selectAuthStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (status === 'initializing') {
    return (
      <Screen padded={false}>
        <Loading label="Loading your journal…" />
      </Screen>
    );
  }

  return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/login'} />;
}
