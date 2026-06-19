import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { Text } from './Text';

function initials(email?: string | null): string | null {
  if (!email) return null;
  const handle = email.split('@')[0] ?? '';
  const letters = handle.replace(/[^a-zA-Z0-9]/g, '');
  return letters ? letters.slice(0, 2).toUpperCase() : null;
}

export function Avatar({ email, size = 64 }: { email?: string | null; size?: number }) {
  const theme = useTheme();
  const label = initials(email);
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {label ? (
        <Text style={[styles.text, { fontSize: size * 0.36, lineHeight: size * 0.46, color: theme.primary }]}>
          {label}
        </Text>
      ) : (
        <Ionicons name="person" size={size * 0.5} color={theme.primary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  text: { fontWeight: '800' },
});
