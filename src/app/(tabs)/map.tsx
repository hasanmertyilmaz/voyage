import { useRouter } from 'expo-router';
import { useMemo } from 'react';
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

  const located = useMemo(
    () => entries.filter((entry) => entry.latitude != null && entry.longitude != null),
    [entries],
  );

  // A region that comfortably frames every trip pin (deterministic, no ref).
  const region = useMemo(() => {
    if (located.length === 0) return null;
    const lats = located.map((entry) => entry.latitude as number);
    const lngs = located.map((entry) => entry.longitude as number);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max((maxLat - minLat) * 1.6, 6),
      longitudeDelta: Math.max((maxLng - minLng) * 1.6, 6),
    };
  }, [located]);

  const renderContent = () => {
    if (!mapsAvailable || !MapView || !Marker) {
      return (
        <EmptyState
          icon="map-outline"
          title="Map unavailable here"
          message="Maps need a device or development build. Trips with a location still appear in your journal."
        />
      );
    }
    if (located.length === 0 || !region) {
      return (
        <EmptyState
          icon="location-outline"
          title="No mapped trips yet"
          message="Add a location to a trip and it will show up here."
        />
      );
    }
    const MapComponent = MapView;
    const MarkerComponent = Marker;
    return (
      <MapComponent style={StyleSheet.absoluteFill} initialRegion={region}>
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
