export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const WEATHER_API_BASE =
  process.env.EXPO_PUBLIC_WEATHER_API_BASE ?? 'https://api.open-meteo.com/v1';
export const GEOCODING_API_BASE =
  process.env.EXPO_PUBLIC_GEOCODING_API_BASE ?? 'https://geocoding-api.open-meteo.com/v1';

export const PHOTO_BUCKET = 'entry-photos';

export const isSupabaseConfigured = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
