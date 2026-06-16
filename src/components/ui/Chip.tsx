import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './Text';

type ChipTone = 'neutral' | 'primary' | 'accent' | 'danger' | 'success';

interface ChipProps {
  label: string;
  tone?: ChipTone;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, tone = 'neutral', style }: ChipProps) {
  const theme = useTheme();
  const tones: Record<ChipTone, { bg: string; fg: string }> = {
    neutral: { bg: theme.surfaceAlt, fg: theme.textSecondary },
    primary: { bg: theme.primary, fg: theme.onPrimary },
    accent: { bg: theme.accent, fg: '#FFFFFF' },
    danger: { bg: theme.danger, fg: '#FFFFFF' },
    success: { bg: theme.success, fg: '#FFFFFF' },
  };
  const colors = tones[tone];

  return (
    <View style={[styles.chip, { backgroundColor: colors.bg }, style]}>
      <Text variant="caption" style={{ color: colors.fg }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
});
