import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Text } from '@/components/ui/Text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import { removeEntry, selectEntryById } from '@/store/slices/entriesSlice';
import { selectUnits } from '@/store/slices/settingsSlice';
import { formatDate } from '@/utils/formatDate';
import { formatCoords } from '@/utils/geo';
import { formatTemperature, weatherCodeToInfo } from '@/utils/weather';

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const theme = useTheme();
  const user = useAppSelector(selectAuthUser);
  const units = useAppSelector(selectUnits);
  const entry = useAppSelector(selectEntryById(id));

  if (!entry) {
    return <EmptyState emoji="🔍" title="Trip not found" message="It may have been deleted." />;
  }

  const confirmDelete = () => {
    Alert.alert('Delete trip', `Delete "${entry.title}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!user) return;
          await dispatch(removeEntry({ userId: user.id, entry }));
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
    >
      <Stack.Screen options={{ title: entry.title }} />

      {entry.photoUrl ? (
        <Image
          source={{ uri: entry.photoUrl }}
          style={styles.photo}
          contentFit="cover"
          transition={200}
        />
      ) : null}

      <Text variant="display">{entry.title}</Text>

      <View style={styles.metaRow}>
        <Chip label={formatDate(entry.tripDate)} />
        {entry.weather ? (
          <Chip
            tone="primary"
            label={`${weatherCodeToInfo(entry.weather.weatherCode).emoji} ${formatTemperature(
              entry.weather.temperatureC,
              units,
            )} · ${weatherCodeToInfo(entry.weather.weatherCode).label}`}
          />
        ) : null}
      </View>

      {entry.placeName || entry.latitude != null ? (
        <View style={styles.section}>
          <Text variant="label" color="textSecondary">
            Location
          </Text>
          <Text variant="body">
            📍 {entry.placeName ?? formatCoords(entry.latitude, entry.longitude)}
          </Text>
          {entry.latitude != null ? (
            <Text variant="caption" color="textMuted">
              {formatCoords(entry.latitude, entry.longitude)}
            </Text>
          ) : null}
        </View>
      ) : null}

      {entry.notes ? (
        <View style={styles.section}>
          <Text variant="label" color="textSecondary">
            Notes
          </Text>
          <Text variant="body">{entry.notes}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <View style={styles.flex}>
          <Button
            title="Edit"
            variant="secondary"
            onPress={() => router.push(`/modal/edit/${entry.id}`)}
          />
        </View>
        <View style={styles.flex}>
          <Button title="Delete" variant="danger" onPress={confirmDelete} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  photo: { width: '100%', height: 240, borderRadius: Radius.lg },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  section: { gap: Spacing.xs },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  flex: { flex: 1 },
});
