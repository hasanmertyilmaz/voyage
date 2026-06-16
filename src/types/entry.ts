/** Domain types shared across the app. */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** A point-in-time weather reading stored alongside an entry. */
export interface WeatherSnapshot {
  temperatureC: number;
  weatherCode: number;
  /** ISO timestamp the reading was captured. */
  capturedAt: string;
}

/** A travel journal entry as persisted in Supabase (camelCase domain shape). */
export interface Entry {
  id: string;
  userId: string;
  title: string;
  notes: string;
  latitude: number | null;
  longitude: number | null;
  placeName: string | null;
  photoUrl: string | null;
  /** Storage path, kept so the photo can be removed when the entry is deleted. */
  photoPath: string | null;
  weather: WeatherSnapshot | null;
  /** ISO date (YYYY-MM-DD) the trip took place. */
  tripDate: string;
  createdAt: string;
  updatedAt: string;
}

/** The mutable shape used by the create/edit form before persistence. */
export interface EntryDraft {
  title: string;
  notes: string;
  latitude: number | null;
  longitude: number | null;
  placeName: string | null;
  /** Local `file://` uri selected from camera/gallery, uploaded on save. */
  photoLocalUri: string | null;
  /** Existing remote url + path when editing an entry that already has a photo. */
  photoUrl: string | null;
  photoPath: string | null;
  weather: WeatherSnapshot | null;
  tripDate: string;
}

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
