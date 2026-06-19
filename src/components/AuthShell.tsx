import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useThemeContext } from '@/theme/theme-context';

import { Text } from './ui/Text';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

/** Gradient hero + centered form card shared by the login and register screens. */
export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  const theme = useTheme();
  const { gradients } = useThemeContext();

  return (
    <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.1 }} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.hero}>
              <View style={styles.logoCircle}>
                <Ionicons name="compass" size={46} color="#FFFFFF" />
              </View>
              <Text style={styles.brand}>{title}</Text>
              <Text style={styles.tagline}>{subtitle}</Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.surface }]}>{children}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl, gap: Spacing.xxl },
  hero: { alignItems: 'center', gap: Spacing.sm },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  brand: { color: '#FFFFFF', fontSize: 34, fontWeight: '800', letterSpacing: 0.5, lineHeight: 42 },
  tagline: { color: 'rgba(255,255,255,0.85)', fontSize: 15 },
  card: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
});
