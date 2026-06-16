import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Entry } from '@/types/entry';

const entriesKey = (userId: string) => `voyage.entries.${userId}`;

export async function cacheEntries(userId: string, entries: Entry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(entriesKey(userId), JSON.stringify(entries));
  } catch {
    // A failed cache write must never break the online flow.
  }
}

export async function readCachedEntries(userId: string): Promise<Entry[]> {
  try {
    const raw = await AsyncStorage.getItem(entriesKey(userId));
    return raw ? (JSON.parse(raw) as Entry[]) : [];
  } catch {
    return [];
  }
}

export async function clearCachedEntries(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(entriesKey(userId));
  } catch {
    // ignore
  }
}
