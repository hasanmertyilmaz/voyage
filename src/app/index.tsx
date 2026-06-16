import { Loading } from '@/components/ui/Loading';
import { Screen } from '@/components/ui/Screen';

export default function IndexScreen() {
  return (
    <Screen padded={false}>
      <Loading label="Loading your journal…" />
    </Screen>
  );
}
