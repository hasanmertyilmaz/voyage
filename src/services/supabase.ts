import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from '@/constants/config';

import { secureStorageAdapter } from './secureStorage';

// Fall back to a syntactically-valid placeholder so the app still boots when no
// .env is present (the UI surfaces a "configure Supabase" message instead of
// crashing on import). Real calls fail and are handled by the error states.
const url = isSupabaseConfigured ? SUPABASE_URL : 'https://placeholder.supabase.co';
const anonKey = isSupabaseConfigured ? SUPABASE_ANON_KEY : 'public-anon-placeholder';

export const supabase = createClient(url, anonKey, {
  auth: {
    // Session token persisted in the secure keychain on native; the web SDK
    // default (localStorage) is fine for the web target.
    storage: Platform.OS === 'web' ? undefined : secureStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Recommended Supabase pattern: only refresh the session while the app is in
// the foreground to avoid wasted network and battery.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
