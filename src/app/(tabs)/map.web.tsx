import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { GradientHeader } from '@/components/GradientHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/use-theme';
import { useAppSelector } from '@/store/hooks';
import { selectEntries } from '@/store/slices/entriesSlice';

const LEAFLET_VERSION = '1.9.4';

// Load Leaflet (free, key-less, OpenStreetMap tiles) from a CDN once, on web only.
function loadLeaflet(): Promise<any> {
  return new Promise((resolve) => {
    const w = window as any;
    if (w.L) {
      resolve(w.L);
      return;
    }
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
      document.head.appendChild(link);
    }
    let script = document.getElementById('leaflet-js') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;
      document.head.appendChild(script);
    }
    script.addEventListener('load', () => resolve((window as any).L));
    if (w.L) resolve(w.L);
  });
}

export default function MapWebScreen() {
  const entries = useAppSelector(selectEntries);
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const located = useMemo(
    () => entries.filter((entry) => entry.latitude != null && entry.longitude != null),
    [entries],
  );

  useEffect(() => {
    if (located.length === 0) return undefined;
    let map: any;
    let cancelled = false;

    loadLeaflet().then((L: any) => {
      if (cancelled || !containerRef.current) return;
      const points: [number, number][] = located.map((entry) => [
        entry.latitude as number,
        entry.longitude as number,
      ]);

      map = L.map(containerRef.current).setView(points[0], 4);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      located.forEach((entry, index) => {
        L.marker(points[index])
          .addTo(map)
          .bindPopup(`<strong>${entry.title}</strong><br/>${entry.placeName ?? ''}`);
      });

      if (points.length > 1) map.fitBounds(points, { padding: [60, 60], maxZoom: 6 });
      setTimeout(() => map?.invalidateSize(), 120);
    });

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [located]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title="Map" subtitle="Where you've been" />
      {located.length === 0 ? (
        <EmptyState
          emoji="📍"
          title="No mapped trips yet"
          message="Add a location to a trip and it will show up here."
        />
      ) : (
        <View style={styles.mapWrap}>
          <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapWrap: { flex: 1, overflow: 'hidden' },
});
