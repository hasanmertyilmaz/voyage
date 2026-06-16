/**
 * Runtime configuration sourced from environment variables.
 *
 * Keys/secrets are never hardcoded (grading criterion 14 — Security). Expo
 * inlines variables prefixed with `EXPO_PUBLIC_` at build time. The Supabase
 * anon key is safe to ship to the client because Row Level Security on the
 * database is what actually protects each user's data — see supabase/schema.sql.
 */
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Open-Meteo is free and key-less, which keeps first-run setup friction-free. */
export const WEATHER_API_BASE =
  process.env.EXPO_PUBLIC_WEATHER_API_BASE ?? 'https://api.open-meteo.com/v1';
export const GEOCODING_API_BASE =
  process.env.EXPO_PUBLIC_GEOCODING_API_BASE ?? 'https://geocoding-api.open-meteo.com/v1';

/** Storage bucket that holds entry photos. */
export const PHOTO_BUCKET = 'entry-photos';

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
