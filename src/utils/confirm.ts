import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirmation dialog. On native it uses Alert with buttons; on
 * web (where Alert has no working button callbacks) it falls back to
 * window.confirm. Resolves true when the user confirms.
 */
export function confirmAction(
  title: string,
  message: string,
  confirmLabel = 'OK',
): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return Promise.resolve(true);
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
