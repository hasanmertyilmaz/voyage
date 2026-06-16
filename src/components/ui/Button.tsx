import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useHaptics } from '@/hooks/useHaptics';
import { useThemeContext } from '@/theme/theme-context';

import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  accessibilityLabel,
}: ButtonProps) {
  const theme = useTheme();
  const { isDark } = useThemeContext();
  const { impact } = useHaptics();
  const isDisabled = disabled || loading;

  const gradient: readonly [string, string] | null =
    variant === 'primary'
      ? [theme.primary, theme.primaryDark]
      : variant === 'danger'
        ? ['#FB7185', theme.danger]
        : null;
  const fg =
    variant === 'secondary' ? theme.text : variant === 'ghost' ? theme.primary : '#FFFFFF';

  const content = loading ? (
    <ActivityIndicator color={fg} />
  ) : (
    <View style={styles.content}>
      {icon}
      <Text style={[styles.label, { color: fg }]}>{title}</Text>
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={accessibilityLabel ?? title}
      disabled={isDisabled}
      onPress={() => {
        impact();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.wrap,
        fullWidth && styles.fullWidth,
        gradient && !isDark ? { shadowColor: gradient[1], ...styles.shadow } : null,
        { opacity: isDisabled ? 0.55 : 1, transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }] },
      ]}
    >
      {gradient ? (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        >
          {content}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.fill,
            {
              backgroundColor: variant === 'secondary' ? theme.surfaceAlt : 'transparent',
              borderWidth: variant === 'secondary' ? 1 : 0,
              borderColor: theme.border,
            },
          ]}
        >
          {content}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: Radius.lg },
  fullWidth: { alignSelf: 'stretch' },
  shadow: {
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fill: {
    minHeight: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: { fontWeight: '700', letterSpacing: 0.3, fontSize: 16 },
});
