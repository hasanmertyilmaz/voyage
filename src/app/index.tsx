import { Loading } from '@/components/ui/Loading';
import { Screen } from '@/components/ui/Screen';

/**
 * Entry route shown while the persisted session is restored. The root layout's
 * auth gate then redirects to the tabs or the login screen.
 */
export default function IndexScreen() {
  return (
    <Screen padded={false}>
      <Loading label="Loading your journal…" />
    </Screen>
  );
}
