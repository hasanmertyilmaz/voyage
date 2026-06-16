import { GEOCODING_API_BASE } from '@/constants/config';

export interface PlaceResult {
  id: number;
  name: string;
  country: string | null;
  admin1: string | null;
  latitude: number;
  longitude: number;
}

interface RawPlace {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

/**
 * Forward-geocode a city/country query using the Open-Meteo geocoding API
 * (free, key-less). Returns up to 5 matching places.
 */
export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = `${GEOCODING_API_BASE}/search?name=${encodeURIComponent(trimmed)}&count=5&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Place search failed.');

  const data = (await response.json()) as { results?: RawPlace[] };
  return (data.results ?? []).map((place) => ({
    id: place.id,
    name: place.name,
    country: place.country ?? null,
    admin1: place.admin1 ?? null,
    latitude: place.latitude,
    longitude: place.longitude,
  }));
}

/** "Lisbon, Lisbon, Portugal" style label from a place result. */
export function formatPlaceLabel(place: PlaceResult): string {
  return [place.name, place.admin1, place.country].filter(Boolean).join(', ');
}
