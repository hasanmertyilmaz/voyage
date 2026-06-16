import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Button } from './Button';
import { Text } from './Text';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji = '🗺️', title, message, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: theme.surfaceAlt }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text variant="subtitle" style={styles.center}>
        {title}
      </Text>
      {message ? (
        <Text variant="bodyMuted" style={styles.center}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button title={actionLabel} onPress={onAction} fullWidth={false} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  badge: { width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 52 },
  center: { textAlign: 'center' },
  action: { marginTop: Spacing.sm },
});
