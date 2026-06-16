import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Units } from '@/store/slices/settingsSlice';
import type { Entry } from '@/types/entry';
import { formatDate } from '@/utils/formatDate';

import { Text } from './ui/Text';
import { WeatherBadge } from './WeatherBadge';

export interface EntryCardProps {
  entry: Entry;
  units: Units;
  onPress?: (entry: Entry) => void;
}

/**
 * Presentational list item (no data dependencies → trivially testable). Wrapped
 * in React.memo so list scrolling doesn't re-render unchanged rows (criterion 9).
 */
function EntryCardComponent({ entry, units, onPress }: EntryCardProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${entry.title}`}
      onPress={() => onPress?.(entry)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      {entry.photoUrl ? (
        <Image source={{ uri: entry.photoUrl }} style={styles.image} contentFit="cover" transition={200} />
      ) : (
        <View style={[styles.image, styles.imageFallback, { backgroundColor: theme.surfaceAlt }]}>
          <Text style={styles.fallbackEmoji}>📷</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text variant="subtitle" numberOfLines={1}>
          {entry.title}
        </Text>
        <Text variant="caption" color="textSecondary" numberOfLines={1}>
          📍 {entry.placeName ?? 'No location'}
        </Text>
        <View style={styles.footer}>
          <Text variant="caption" color="textMuted">
            {formatDate(entry.tripDate)}
          </Text>
          {entry.weather ? <WeatherBadge weather={entry.weather} units={units} compact /> : null}
        </View>
      </View>
    </Pressable>
  );
}

export const EntryCard = memo(EntryCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 170 },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  fallbackEmoji: { fontSize: 40 },
  body: { padding: Spacing.lg, gap: Spacing.xs },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
});
