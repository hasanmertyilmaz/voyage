import { forwardRef } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './Text';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, style, ...rest }, ref) => {
    const theme = useTheme();
    return (
      <View style={styles.container}>
        {label ? (
          <Text variant="label" color="textSecondary">
            {label}
          </Text>
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor={theme.textMuted}
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.surface,
              borderColor: error ? theme.danger : theme.border,
            },
            style,
          ]}
          {...rest}
        />
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
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
  },
});
