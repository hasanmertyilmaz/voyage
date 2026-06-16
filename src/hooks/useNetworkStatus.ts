import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

const isOnline = (state: { isConnected: boolean | null; isInternetReachable: boolean | null }) =>
  Boolean(state.isConnected) && state.isInternetReachable !== false;

/**
 * Subscribes to connectivity changes (grading criterion 12/13). Returns whether
 * the device currently has a usable internet connection.
 */
export function useNetworkStatus(): boolean {
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => setConnected(isOnline(state)));
    NetInfo.fetch().then((state) => setConnected(isOnline(state)));
    return unsubscribe;
  }, []);

  return connected;
}
