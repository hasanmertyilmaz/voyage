export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface WeatherSnapshot {
  temperatureC: number;
  weatherCode: number;

  capturedAt: string;
}

export interface Entry {
  id: string;
  userId: string;
  title: string;
  notes: string;
  latitude: number | null;
  longitude: number | null;
  placeName: string | null;
  photoUrl: string | null;

  photoPath: string | null;
  weather: WeatherSnapshot | null;

  tripDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface EntryDraft {
  title: string;
  notes: string;
  latitude: number | null;
  longitude: number | null;
  placeName: string | null;

  photoLocalUri: string | null;

  photoUrl: string | null;
  photoPath: string | null;
  weather: WeatherSnapshot | null;
  tripDate: string;
}

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
