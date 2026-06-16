import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { EntryForm } from '@/components/EntryForm';
import { Screen } from '@/components/ui/Screen';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import { addEntry, selectMutationStatus } from '@/store/slices/entriesSlice';
import { selectUnits } from '@/store/slices/settingsSlice';
import type { EntryDraft } from '@/types/entry';

export default function NewEntryScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector(selectAuthUser);
  const units = useAppSelector(selectUnits);
  const status = useAppSelector(selectMutationStatus);

  const handleSubmit = async (draft: EntryDraft) => {
    if (!user) return;
    const result = await dispatch(addEntry({ userId: user.id, draft }));
    if (addEntry.fulfilled.match(result)) {
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)');
    } else {
      Alert.alert('Could not save', (result.payload as string) ?? 'Please try again.');
    }
  };

  return (
    <Screen scroll edges={['bottom']}>
      <EntryForm
        units={units}
        submitting={status === 'loading'}
        submitLabel="Save trip"
        onSubmit={handleSubmit}
      />
    </Screen>
  );
}
