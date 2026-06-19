import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatPlaceLabel, searchPlaces, type PlaceResult } from '@/services/geocoding';
import { pickFromGallery, takePhoto } from '@/services/imagePicker';
import { getCurrentLocation } from '@/services/location';
import { useLazyGetCurrentWeatherQuery } from '@/store/api/weatherApi';
import type { Units } from '@/store/slices/settingsSlice';
import type { EntryDraft } from '@/types/entry';
import { formatDate, toISODate, todayISODate } from '@/utils/formatDate';
import { formatCoords } from '@/utils/geo';
import { validateEntryDraft } from '@/utils/validation';
import { formatTemperature, weatherCodeToIcon, weatherCodeToInfo } from '@/utils/weather';

import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Text } from './ui/Text';
import { TextField } from './ui/TextField';

export interface EntryFormProps {
  initialDraft?: Partial<EntryDraft>;
  units: Units;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (draft: EntryDraft) => void;
}

const emptyDraft = (): EntryDraft => ({
  title: '',
  notes: '',
  latitude: null,
  longitude: null,
  placeName: null,
  photoLocalUri: null,
  photoUrl: null,
  photoPath: null,
  weather: null,
  tripDate: todayISODate(),
});

export function EntryForm({ initialDraft, units, submitting, submitLabel, onSubmit }: EntryFormProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState<EntryDraft>({ ...emptyDraft(), ...initialDraft });
  const [errors, setErrors] = useState<{ title?: string; notes?: string }>({});
  const [locating, setLocating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [fetchWeather] = useLazyGetCurrentWeatherQuery();

  const update = (patch: Partial<EntryDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const photoPreview = draft.photoLocalUri ?? draft.photoUrl;
  const hasLocation = draft.latitude != null && draft.longitude != null;

  // Set coordinates + place, then capture the weather there (best effort).
  const applyCoords = async (latitude: number, longitude: number, placeName: string | null) => {
    update({ latitude, longitude, placeName });
    try {
      const weather = await fetchWeather({ latitude, longitude }).unwrap();
      update({
        weather: {
          temperatureC: weather.temperatureC,
          weatherCode: weather.weatherCode,
          capturedAt: new Date().toISOString(),
        },
      });
    } catch {
      // Weather is optional context.
    }
  };

  const handlePick = async (mode: 'camera' | 'gallery') => {
    const result = mode === 'camera' ? await takePhoto() : await pickFromGallery();
    if (result.status === 'granted' && result.uri) {
      update({ photoLocalUri: result.uri });
    } else if (result.status === 'denied') {
      Alert.alert(
        'Permission needed',
        `Allow ${mode === 'camera' ? 'camera' : 'photo library'} access in Settings to add a photo.`,
      );
    }
  };

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    try {
      setSearching(true);
      const results = await searchPlaces(trimmed);
      setSearchResults(results);
      if (results.length === 0) {
        Alert.alert('No places found', `Couldn't find "${trimmed}". Try a different spelling.`);
      }
    } catch {
      Alert.alert('Search failed', 'Could not search places. Check your connection and try again.');
    } finally {
      setSearching(false);
    }
  };

  const selectPlace = async (place: PlaceResult) => {
    setSearchResults([]);
    setQuery('');
    await applyCoords(place.latitude, place.longitude, formatPlaceLabel(place));
  };

  const handleLocate = async () => {
    try {
      setLocating(true);
      const location = await getCurrentLocation();
      if (location.status !== 'granted' || !location.coords) {
        Alert.alert(
          'Location unavailable',
          location.status === 'denied'
            ? 'Enable location access in Settings to tag your trip.'
            : 'Could not read your location. Please try again.',
        );
        return;
      }
      await applyCoords(location.coords.latitude, location.coords.longitude, location.placeName ?? null);
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = () => {
    const result = validateEntryDraft(draft);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit(draft);
  };

  return (
    <View style={styles.form}>
      <Card padded={false} style={styles.photoCard}>
        {photoPreview ? (
          <Image source={{ uri: photoPreview }} style={styles.photo} contentFit="cover" transition={150} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder, { backgroundColor: theme.surfaceAlt }]}>
            <Ionicons name="images-outline" size={46} color={theme.textMuted} />
            <Text variant="bodyMuted">Add a photo of your trip</Text>
          </View>
        )}
        <View style={styles.photoButtons}>
          <View style={styles.flex}>
            <Button title="Camera" variant="secondary" onPress={() => handlePick('camera')} />
          </View>
          <View style={styles.flex}>
            <Button title="Gallery" variant="secondary" onPress={() => handlePick('gallery')} />
          </View>
        </View>
      </Card>

      <TextField
        label="Title"
        value={draft.title}
        onChangeText={(title) => update({ title })}
        placeholder="Sunset in Lisbon"
        error={errors.title}
        maxLength={80}
      />

      <TextField
        label="Notes"
        value={draft.notes}
        onChangeText={(notes) => update({ notes })}
        placeholder="What made this place special?"
        error={errors.notes}
        multiline
        numberOfLines={4}
        style={styles.notes}
        maxLength={1000}
      />

      <View>
        <Text variant="label" color="textSecondary">
          Trip date
        </Text>
        <View style={styles.dateRow}>
          <Text variant="body">{formatDate(draft.tripDate)}</Text>
          <Button title="Change" variant="ghost" fullWidth={false} onPress={() => setShowDatePicker(true)} />
        </View>
        {showDatePicker ? (
          <DateTimePicker
            value={new Date(draft.tripDate)}
            mode="date"
            maximumDate={new Date()}
            onChange={(_event, date) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (date) update({ tripDate: toISODate(date) });
            }}
          />
        ) : null}
      </View>

      <Card>
        <View style={styles.cardInner}>
          <Text variant="label" color="textSecondary">
            Location & weather
          </Text>

          {hasLocation ? (
            <View style={styles.locationInfo}>
              <View style={styles.weatherRow}>
                <Ionicons name="location" size={16} color={theme.primary} />
                <Text variant="body" style={styles.flex}>
                  {draft.placeName ?? formatCoords(draft.latitude, draft.longitude)}
                </Text>
              </View>
              <Text variant="caption" color="textMuted">
                {formatCoords(draft.latitude, draft.longitude)}
              </Text>
              {draft.weather ? (
                <View style={styles.weatherRow}>
                  <Ionicons
                    name={weatherCodeToIcon(draft.weather.weatherCode)}
                    size={16}
                    color={theme.primary}
                  />
                  <Text variant="body" color="primary">
                    {formatTemperature(draft.weather.temperatureC, units)} ·{' '}
                    {weatherCodeToInfo(draft.weather.weatherCode).label}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <Text variant="bodyMuted">Search a place, or use your current location.</Text>
          )}

          <TextField
            value={query}
            onChangeText={setQuery}
            placeholder="Search a city or country"
            autoCapitalize="words"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            leftIcon={<Ionicons name="search-outline" size={18} color={theme.textMuted} />}
          />
          <Button title="Search" variant="secondary" loading={searching} onPress={handleSearch} />

          {searchResults.length > 0 ? (
            <View style={styles.results}>
              {searchResults.map((place) => (
                <Pressable
                  key={place.id}
                  accessibilityRole="button"
                  onPress={() => selectPlace(place)}
                  style={({ pressed }) => [
                    styles.resultRow,
                    { borderColor: theme.border, backgroundColor: pressed ? theme.surfaceAlt : theme.surface },
                  ]}
                >
                  <View style={styles.resultInner}>
                    <Ionicons name="location-outline" size={18} color={theme.primary} />
                    <Text variant="body" style={styles.flex}>
                      {formatPlaceLabel(place)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Button
            title={hasLocation ? 'Use current location instead' : 'Use current location'}
            variant="ghost"
            loading={locating}
            onPress={handleLocate}
          />
        </View>
      </Card>

      <Button title={submitLabel} onPress={handleSubmit} loading={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.lg },
  flex: { flex: 1 },
  photoCard: { gap: Spacing.md, padding: Spacing.md },
  photo: { width: '100%', height: 200, borderRadius: Radius.md },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  photoButtons: { flexDirection: 'row', gap: Spacing.md },
  notes: { minHeight: 96, textAlignVertical: 'top', paddingTop: Spacing.sm },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  cardInner: { gap: Spacing.md },
  locationInfo: { gap: Spacing.xs },
  weatherRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  results: { gap: Spacing.xs },
  resultRow: { padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
  resultInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
