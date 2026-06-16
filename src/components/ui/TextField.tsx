import { forwardRef, useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './Text';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, leftIcon, style, onFocus, onBlur, ...rest }, ref) => {
    const theme = useTheme();
    const [focused, setFocused] = useState(false);
    const borderColor = error ? theme.danger : focused ? theme.primary : theme.border;

    return (
      <View style={styles.container}>
        {label ? (
          <Text variant="label" color="textSecondary">
            {label}
          </Text>
        ) : null}
        <View style={[styles.field, { backgroundColor: theme.surface, borderColor }]}>
          {leftIcon ? <View>{leftIcon}</View> : null}
          <TextInput
            ref={ref}
            placeholderTextColor={theme.textMuted}
            style={[styles.input, { color: theme.text }, style]}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            {...rest}
          />
        </View>
        {error ? (
          <Text variant="caption" color="danger">
            {error}
          </Text>
        ) : null}
      </View>
    );
  },
);

TextField.displayName = 'TextField';

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 52,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
  },
  input: { flex: 1, fontSize: FontSize.md, paddingVertical: Spacing.sm },
});
