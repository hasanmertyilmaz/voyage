import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Text } from '@/components/ui/Text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import { removeEntry, selectEntryById } from '@/store/slices/entriesSlice';
import { selectUnits } from '@/store/slices/settingsSlice';
import { useThemeContext } from '@/theme/theme-context';
import { confirmAction } from '@/utils/confirm';
import { formatDate } from '@/utils/formatDate';
import { formatCoords } from '@/utils/geo';
import { formatTemperature, weatherCodeToInfo } from '@/utils/weather';

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const theme = useTheme();
  const { gradients } = useThemeContext();
  const user = useAppSelector(selectAuthUser);
  const units = useAppSelector(selectUnits);
  const entry = useAppSelector(selectEntryById(id));

  if (!entry) {
    return <EmptyState emoji="🔍" title="Trip not found" message="It may have been deleted." />;
  }

  const place = entry.placeName ?? formatCoords(entry.latitude, entry.longitude);

  const confirmDelete = async () => {
    const confirmed = await confirmAction(
      'Delete trip',
      `Delete "${entry.title}"? This can't be undone.`,
      'Delete',
    );
    if (!confirmed || !user) return;
    await dispatch(removeEntry({ userId: user.id, entry }));
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: entry.title }} />

      <View style={styles.hero}>
        {entry.photoUrl ? (
          <Image
            source={{ uri: entry.photoUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <LinearGradient
            colors={gradients.placeholder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        <LinearGradient colors={gradients.cardOverlay} style={StyleSheet.absoluteFill} />
        {!entry.photoUrl ? (
          <View style={styles.ghostWrap}>
            <Text style={styles.ghost}>🧭</Text>
          </View>
        ) : null}
        {entry.weather ? (
          <View style={styles.pill}>
            <Text style={styles.pillText}>
              {weatherCodeToInfo(entry.weather.weatherCode).emoji}{' '}
              {formatTemperature(entry.weather.temperatureC, units)} ·{' '}
              {weatherCodeToInfo(entry.weather.weatherCode).label}
            </Text>
          </View>
        ) : null}
        <View style={styles.heroOverlay}>
          <Text style={styles.title}>{entry.title}</Text>
          <Text style={styles.place}>📍 {place}</Text>
          <Text style={styles.date}>{formatDate(entry.tripDate)}</Text>
        </View>
      </View>

      {entry.notes ? (
        <Card>
          <View style={styles.cardInner}>
            <Text variant="label" color="textSecondary">
              Notes
            </Text>
            <Text variant="body" style={styles.notes}>
              {entry.notes}
            </Text>
          </View>
        </Card>
      ) : null}

      {entry.latitude != null ? (
        <Card>
          <View style={styles.cardInner}>
            <Text variant="label" color="textSecondary">
              Coordinates
            </Text>
            <Text variant="body">{formatCoords(entry.latitude, entry.longitude)}</Text>
          </View>
        </Card>
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
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxxl },
  hero: { height: 300, borderRadius: Radius.xl, overflow: 'hidden', justifyContent: 'flex-end' },
  ghostWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: { fontSize: 80, color: 'rgba(255,255,255,0.5)' },
  pill: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  pillText: { color: '#0F766E', fontWeight: '800', fontSize: 13 },
  heroOverlay: { padding: Spacing.lg, gap: 2 },
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '800' },
  place: { color: 'rgba(255,255,255,0.92)', fontSize: 14, fontWeight: '600' },
  date: { color: 'rgba(255,255,255,0.78)', fontSize: 13, marginTop: 2 },
  cardInner: { gap: Spacing.xs },
  notes: { lineHeight: 22 },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xs },
  flex: { flex: 1 },
});
