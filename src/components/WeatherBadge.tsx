import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { Units } from '@/store/slices/settingsSlice';
import type { WeatherSnapshot } from '@/types/entry';
import { formatTemperature, weatherCodeToInfo } from '@/utils/weather';

import { Text } from './ui/Text';

interface WeatherBadgeProps {
  weather: WeatherSnapshot;
  units: Units;
  compact?: boolean;
}

export function WeatherBadge({ weather, units, compact = false }: WeatherBadgeProps) {
  const info = weatherCodeToInfo(weather.weatherCode);
  return (
    <View style={styles.row}>
      <Text style={compact ? styles.emojiSm : styles.emoji}>{info.emoji}</Text>
      <Text variant={compact ? 'caption' : 'body'}>
        {formatTemperature(weather.temperatureC, units)}
        {compact ? '' : ` · ${info.label}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  emoji: { fontSize: 22 },
  emojiSm: { fontSize: 15 },
});
