import { Text as RNText, StyleSheet, type TextProps } from 'react-native';

import { FontSize, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextVariant =
  | 'display'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodyMuted'
  | 'caption'
  | 'label';

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: ThemeColor;
}

/** Typed, theme-aware Text — the single text primitive used across the app. */
export function Text({ variant = 'body', color, style, ...rest }: AppTextProps) {
  const theme = useTheme();
  const resolvedColor = color
    ? theme[color]
    : variant === 'bodyMuted' || variant === 'caption'
      ? theme.textSecondary
      : theme.text;

  return <RNText style={[styles[variant], { color: resolvedColor }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  display: { fontSize: FontSize.display, fontWeight: '800', letterSpacing: -0.5 },
  title: { fontSize: FontSize.xxl, fontWeight: '700' },
  subtitle: { fontSize: FontSize.xl, fontWeight: '700' },
  body: { fontSize: FontSize.md, fontWeight: '400', lineHeight: 22 },
  bodyMuted: { fontSize: FontSize.md, fontWeight: '400', lineHeight: 22 },
  caption: { fontSize: FontSize.sm, fontWeight: '500' },
  label: { fontSize: FontSize.sm, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
});
