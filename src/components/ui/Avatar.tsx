import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { useThemeContext } from '@/theme/theme-context';

import { Text } from './Text';

function initials(email?: string | null): string {
  if (!email) return '🧭';
  const handle = email.split('@')[0] ?? '';
  const letters = handle.replace(/[^a-zA-Z0-9]/g, '');
  return letters ? letters.slice(0, 2).toUpperCase() : '🧭';
}

export function Avatar({ email, size = 64 }: { email?: string | null; size?: number }) {
  const { gradients } = useThemeContext();
  return (
    <LinearGradient
      colors={gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.text, { fontSize: size * 0.36 }]}>{initials(email)}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#FFFFFF', fontWeight: '800' },
});
