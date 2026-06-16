import * as Location from 'expo-location';

export type PermissionState = 'granted' | 'denied' | 'undetermined';

export interface LocationResult {
  status: PermissionState;
  coords?: { latitude: number; longitude: number };
  placeName?: string | null;
}

export async function getCurrentLocation(): Promise<LocationResult> {
  const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return { status: canAskAgain ? 'undetermined' : 'denied' };
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const coords = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };

  let placeName: string | null = null;
  try {
    const places = await Location.reverseGeocodeAsync(coords);
    if (places.length > 0) {
      const place = places[0];
      placeName = [place.city, place.region, place.country].filter(Boolean).join(', ') || null;
    }
  } catch {}

  return { status: 'granted', coords, placeName };
}
