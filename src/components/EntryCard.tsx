import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { Units } from '@/store/slices/settingsSlice';
import { useThemeContext } from '@/theme/theme-context';
import type { Entry } from '@/types/entry';
import { formatDate } from '@/utils/formatDate';
import { formatCoords } from '@/utils/geo';
import { formatTemperature, weatherCodeToInfo } from '@/utils/weather';

import { Text } from './ui/Text';

export interface EntryCardProps {
  entry: Entry;
  units: Units;
  onPress?: (entry: Entry) => void;
}

/**
 * Travel-style list card: the photo (or a gradient placeholder) fills the card,
 * a dark gradient keeps the white title/place legible, and the weather sits in a
 * floating pill. Memoized so list scrolling skips unchanged rows (criterion 9).
 */
function EntryCardComponent({ entry, units, onPress }: EntryCardProps) {
  const { gradients } = useThemeContext();
  const place = entry.placeName ?? formatCoords(entry.latitude, entry.longitude);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${entry.title}`}
      onPress={() => onPress?.(entry)}
      style={({ pressed }) => [styles.shadow, { transform: [{ scale: pressed ? 0.985 : 1 }] }]}
    >
      <View style={styles.card}>
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
              {formatTemperature(entry.weather.temperatureC, units)}
            </Text>
          </View>
        ) : null}

        <View style={styles.overlay}>
          <Text style={styles.title} numberOfLines={1}>
            {entry.title}
          </Text>
          <Text style={styles.place} numberOfLines={1}>
            📍 {place}
          </Text>
          <Text style={styles.date}>{formatDate(entry.tripDate)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export const EntryCard = memo(EntryCardComponent);

const styles = StyleSheet.create({
  shadow: {
    borderRadius: Radius.xl,
    shadowColor: '#0F172A',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  card: { height: 220, borderRadius: Radius.xl, overflow: 'hidden', justifyContent: 'flex-end' },
  ghostWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: { fontSize: 60, color: 'rgba(255,255,255,0.6)' },
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
  overlay: { padding: Spacing.lg, gap: 2 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  place: { color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: '600' },
  date: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
});
