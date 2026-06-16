import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './Text';

export function Loading({ label }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={theme.primary} />
      {label ? <Text variant="bodyMuted">{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
});
