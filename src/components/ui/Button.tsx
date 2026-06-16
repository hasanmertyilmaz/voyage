import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useHaptics } from '@/hooks/useHaptics';

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
  const { impact } = useHaptics();
  const isDisabled = disabled || loading;

  const palette: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
    primary: { bg: theme.primary, fg: theme.onPrimary, border: theme.primary },
    secondary: { bg: theme.surfaceAlt, fg: theme.text, border: theme.border },
    ghost: { bg: 'transparent', fg: theme.primary, border: 'transparent' },
    danger: { bg: theme.danger, fg: '#FFFFFF', border: theme.danger },
  };
  const colors = palette[variant];

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
        styles.base,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          opacity: isDisabled ? 0.5 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
        },
        fullWidth && styles.fullWidth,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.fg} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.label, { color: colors.fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: { fontWeight: '700' },
});
