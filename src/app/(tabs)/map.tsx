import { useRouter } from 'expo-router';
import { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { GradientHeader } from '@/components/GradientHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/use-theme';
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
  const theme = useTheme();
  const router = useRouter();
  const mapRef = useRef<any>(null);

  const located = useMemo(
    () => entries.filter((entry) => entry.latitude != null && entry.longitude != null),
    [entries],
  );

  const renderContent = () => {
    if (!mapsAvailable || !MapView || !Marker) {
      return (
        <EmptyState
          emoji="🗺️"
          title="Map unavailable here"
          message="Maps need a device or development build. Trips with a location still appear in your journal."
        />
      );
    }
    if (located.length === 0) {
      return (
        <EmptyState
          emoji="📍"
          title="No mapped trips yet"
          message="Add a location to a trip and it will show up here."
        />
      );
    }
    const MapComponent = MapView;
    const MarkerComponent = Marker;
    return (
      <MapComponent
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: located[0].latitude as number,
          longitude: located[0].longitude as number,
          latitudeDelta: 40,
          longitudeDelta: 40,
        }}
        onMapReady={() => {
          if (located.length > 1) {
            mapRef.current?.fitToCoordinates(
              located.map((entry) => ({
                latitude: entry.latitude as number,
                longitude: entry.longitude as number,
              })),
              { edgePadding: { top: 80, right: 80, bottom: 80, left: 80 }, animated: false },
            );
          }
        }}
      >
        {located.map((entry) => (
          <MarkerComponent
            key={entry.id}
            coordinate={{ latitude: entry.latitude as number, longitude: entry.longitude as number }}
            title={entry.title}
            description={entry.placeName ?? undefined}
            onCalloutPress={() => router.push(`/entry/${entry.id}`)}
          />
        ))}
      </MapComponent>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title="Map" subtitle="Where you've been" />
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
