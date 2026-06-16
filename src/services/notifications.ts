import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Show reminders as a banner while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const CHANNEL_ID = 'reminders';

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Trip reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/**
 * Schedule a local "time to journal" reminder a number of days from now.
 * Returns the notification id, or null if permission was not granted.
 */
export async function scheduleTripReminder(daysFromNow: number, message: string): Promise<string | null> {
  const granted = await ensureNotificationPermission();
  if (!granted) return null;
  await ensureAndroidChannel();

  return Notifications.scheduleNotificationAsync({
    content: { title: 'Time to journal ✈️', body: message },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.round(daysFromNow * 24 * 60 * 60)),
      channelId: CHANNEL_ID,
    },
  });
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function countScheduledReminders(): Promise<number> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.length;
}
