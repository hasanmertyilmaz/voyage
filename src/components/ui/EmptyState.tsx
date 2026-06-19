import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useThemeContext } from '@/theme/theme-context';

import { Button } from './Button';
import { Text } from './Text';

type IconName = keyof typeof Ionicons.glyphMap;

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'airplane-outline',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { gradients } = useThemeContext();
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.badge}
      >
        <Ionicons name={icon} size={44} color="#FFFFFF" />
      </LinearGradient>
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
  badge: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0D9488',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    marginBottom: Spacing.xs,
  },
  center: { textAlign: 'center' },
  action: { marginTop: Spacing.sm },
});
