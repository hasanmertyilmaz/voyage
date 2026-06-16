import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { useAppSelector } from '@/store/hooks';
import { selectEntries } from '@/store/slices/entriesSlice';

// react-native-maps relies on a native module that isn't present on web and may
// be missing in some Expo Go builds — require defensively so the rest of the app
// is unaffected if it can't load.
let MapView: typeof import('react-native-maps').default | null = null;
let Marker: typeof import('react-native-maps').Marker | null = null;
let mapsAvailable = true;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
} catch {
  mapsAvailable = false;
}

export default function MapScreen() {
  const entries = useAppSelector(selectEntries);
  const router = useRouter();

  const located = useMemo(
    () => entries.filter((entry) => entry.latitude != null && entry.longitude != null),
    [entries],
  );

  if (!mapsAvailable || !MapView || !Marker) {
    return (
      <Screen>
        <EmptyState
          emoji="🗺️"
          title="Map unavailable here"
          message="Maps need a device or development build. Trips with a location still appear in your journal."
        />
      </Screen>
    );
  }

  if (located.length === 0) {
    return (
      <Screen>
        <EmptyState
          emoji="📍"
          title="No mapped trips yet"
          message="Add a location to a trip and it will show up here."
        />
      </Screen>
    );
  }

  const MapComponent = MapView;
  const MarkerComponent = Marker;

  return (
    <View style={styles.container}>
      <MapComponent
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: located[0].latitude as number,
          longitude: located[0].longitude as number,
          latitudeDelta: 40,
          longitudeDelta: 40,
        }}
      >
        {located.map((entry) => (
          <MarkerComponent
            key={entry.id}
            coordinate={{
              latitude: entry.latitude as number,
              longitude: entry.longitude as number,
            }}
            title={entry.title}
            description={entry.placeName ?? undefined}
            onCalloutPress={() => router.push(`/entry/${entry.id}`)}
          />
        ))}
      </MapComponent>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
