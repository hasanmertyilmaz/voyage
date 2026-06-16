import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import { useThemeContext } from '@/theme/theme-context';

import { Text } from './ui/Text';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

/** Rounded gradient app-bar used at the top of the main tab screens. */
export function GradientHeader({ title, subtitle, right }: GradientHeaderProps) {
  const { gradients } = useThemeContext();
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + Spacing.md }]}
    >
      <View style={styles.row}>
        <View style={styles.titles}>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <Text style={styles.title}>{title}</Text>
        </View>
        {right}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  titles: { flex: 1, gap: 2 },
  subtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
});
