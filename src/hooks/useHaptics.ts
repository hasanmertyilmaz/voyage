import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Platform } from 'react-native';

/**
 * Thin wrapper around expo-haptics (extended criterion D — haptic feedback).
 * No-ops on web and swallows errors so a failed buzz never breaks an action.
 */
export function useHaptics() {
  const supported = Platform.OS !== 'web';

  return useMemo(
    () => ({
      impact: (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
        if (supported) Haptics.impactAsync(style).catch(() => undefined);
      },
      notify: (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
        if (supported) Haptics.notificationAsync(type).catch(() => undefined);
      },
      selection: () => {
        if (supported) Haptics.selectionAsync().catch(() => undefined);
      },
    }),
    [supported],
  );
}
