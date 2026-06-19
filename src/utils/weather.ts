import { Ionicons } from '@expo/vector-icons';

export interface WeatherInfo {
  code: number;
  label: string;
  emoji: string;
}

const WEATHER_MAP: Record<number, { label: string; emoji: string }> = {
  0: { label: 'Clear sky', emoji: '☀️' },
  1: { label: 'Mainly clear', emoji: '🌤️' },
  2: { label: 'Partly cloudy', emoji: '⛅' },
  3: { label: 'Overcast', emoji: '☁️' },
  45: { label: 'Fog', emoji: '🌫️' },
  48: { label: 'Rime fog', emoji: '🌫️' },
  51: { label: 'Light drizzle', emoji: '🌦️' },
  53: { label: 'Drizzle', emoji: '🌦️' },
  55: { label: 'Heavy drizzle', emoji: '🌧️' },
  61: { label: 'Light rain', emoji: '🌧️' },
  63: { label: 'Rain', emoji: '🌧️' },
  65: { label: 'Heavy rain', emoji: '🌧️' },
  71: { label: 'Light snow', emoji: '🌨️' },
  73: { label: 'Snow', emoji: '🌨️' },
  75: { label: 'Heavy snow', emoji: '❄️' },
  80: { label: 'Rain showers', emoji: '🌦️' },
  81: { label: 'Rain showers', emoji: '🌧️' },
  82: { label: 'Violent showers', emoji: '⛈️' },
  95: { label: 'Thunderstorm', emoji: '⛈️' },
  96: { label: 'Thunderstorm, hail', emoji: '⛈️' },
  99: { label: 'Severe thunderstorm', emoji: '⛈️' },
};

export function weatherCodeToInfo(code: number): WeatherInfo {
  const match = WEATHER_MAP[code] ?? { label: 'Unknown', emoji: '🌍' };
  return { code, ...match };
}

export type WeatherIconName = keyof typeof Ionicons.glyphMap;

// Map Open-Meteo WMO codes to Ionicons so the weather UI never relies on emoji glyphs.
export function weatherCodeToIcon(code: number): WeatherIconName {
  if (code === 0) return 'sunny';
  if (code <= 2) return 'partly-sunny';
  if (code <= 48) return 'cloudy';
  if (code <= 67) return 'rainy';
  if (code <= 77) return 'snow';
  if (code <= 82) return 'rainy';
  if (code <= 86) return 'snow';
  return 'thunderstorm';
}

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function formatTemperature(celsius: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (Number.isNaN(celsius)) return '—';
  if (unit === 'imperial') return `${Math.round(celsiusToFahrenheit(celsius))}°F`;
  return `${Math.round(celsius)}°C`;
}
