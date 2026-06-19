import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { EntryForm } from '@/components/EntryForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import { editEntry, selectEntryById, selectMutationStatus } from '@/store/slices/entriesSlice';
import { selectUnits } from '@/store/slices/settingsSlice';
import type { EntryDraft } from '@/types/entry';

export default function EditEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector(selectAuthUser);
  const units = useAppSelector(selectUnits);
  const status = useAppSelector(selectMutationStatus);
  const entry = useAppSelector(selectEntryById(id));

  if (!entry) {
    return (
      <Screen>
        <EmptyState icon="search-outline" title="Trip not found" message="It may have been deleted." />
      </Screen>
    );
  }

  const handleSubmit = async (draft: EntryDraft) => {
    if (!user) return;
    const result = await dispatch(editEntry({ userId: user.id, id: entry.id, draft }));
    if (editEntry.fulfilled.match(result)) {
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)');
    } else {
      Alert.alert('Could not update', (result.payload as string) ?? 'Please try again.');
    }
  };

  const initialDraft: Partial<EntryDraft> = {
    title: entry.title,
    notes: entry.notes,
    latitude: entry.latitude,
    longitude: entry.longitude,
    placeName: entry.placeName,
    photoUrl: entry.photoUrl,
    photoPath: entry.photoPath,
    weather: entry.weather,
    tripDate: entry.tripDate,
  };

  return (
    <Screen scroll edges={['bottom']}>
      <EntryForm
        initialDraft={initialDraft}
        units={units}
        submitting={status === 'loading'}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
      />
    </Screen>
  );
}
