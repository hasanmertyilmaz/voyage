import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';

import { Button } from './Button';
import { Text } from './Text';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text variant="subtitle" style={styles.center}>
        {title}
      </Text>
      <Text variant="bodyMuted" style={styles.center}>
        {message}
      </Text>
      {onRetry ? (
        <View style={styles.action}>
          <Button title="Try again" onPress={onRetry} variant="secondary" fullWidth={false} />
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
  emoji: { fontSize: 48 },
  center: { textAlign: 'center' },
  action: { marginTop: Spacing.sm },
});
