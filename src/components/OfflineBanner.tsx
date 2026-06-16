import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

import { Text } from './ui/Text';

/** A dismissible-on-reconnect banner shown whenever the device is offline. */
export function OfflineBanner() {
  const online = useNetworkStatus();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  if (online) return null;

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      style={[styles.banner, { backgroundColor: theme.warning, paddingTop: insets.top + Spacing.xs }]}
    >
      <Text variant="caption" style={styles.text}>
        You&apos;re offline — showing your saved trips
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    alignItems: 'center',
    paddingBottom: Spacing.xs,
  },
  text: { color: '#1F2937', fontWeight: '700' },
});
