import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Safe-area aware screen container. Uses Flexbox + relative units only (no
 * hardcoded screen widths) so it adapts to any device size (criterion 2).
 */
export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['top', 'left', 'right'],
  style,
  contentContainerStyle,
}: ScreenProps) {
  const theme = useTheme();
  const padding = padded ? Spacing.lg : 0;

  if (scroll) {
    return (
      <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: theme.background }]}>
        <ScrollView
          contentContainerStyle={[{ padding, gap: Spacing.lg }, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: theme.background }]}>
      <View style={[styles.flex, { padding }, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
