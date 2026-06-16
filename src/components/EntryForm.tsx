import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { pickFromGallery, takePhoto } from '@/services/imagePicker';
import { getCurrentLocation } from '@/services/location';
import { useLazyGetCurrentWeatherQuery } from '@/store/api/weatherApi';
import type { Units } from '@/store/slices/settingsSlice';
import type { EntryDraft } from '@/types/entry';
import { formatDate, toISODate, todayISODate } from '@/utils/formatDate';
import { formatCoords } from '@/utils/geo';
import { validateEntryDraft } from '@/utils/validation';
import { formatTemperature, weatherCodeToInfo } from '@/utils/weather';

import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Chip } from './ui/Chip';
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

/**
 * Reusable create/edit form. Owns the draft state and the native integrations
 * (camera/gallery, location + reverse geocode, live weather lookup), then hands
 * a validated draft back to the screen via onSubmit.
 */
export function EntryForm({ initialDraft, units, submitting, submitLabel, onSubmit }: EntryFormProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState<EntryDraft>({ ...emptyDraft(), ...initialDraft });
  const [errors, setErrors] = useState<{ title?: string; notes?: string }>({});
  const [locating, setLocating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fetchWeather] = useLazyGetCurrentWeatherQuery();

  const update = (patch: Partial<EntryDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const photoPreview = draft.photoLocalUri ?? draft.photoUrl;
  const hasLocation = draft.latitude != null && draft.longitude != null;

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
      update({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        placeName: location.placeName ?? null,
      });
      // Capture the weather at this spot — best effort, never blocks saving.
      try {
        const weather = await fetchWeather(location.coords).unwrap();
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
            <Text style={styles.photoEmoji}>🏞️</Text>
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
          <Button
            title="Change"
            variant="ghost"
            fullWidth={false}
            onPress={() => setShowDatePicker(true)}
          />
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
        <Text variant="label" color="textSecondary">
          Location & weather
        </Text>
        {hasLocation ? (
          <View style={styles.locationInfo}>
            <Text variant="body">📍 {draft.placeName ?? formatCoords(draft.latitude, draft.longitude)}</Text>
            <Text variant="caption" color="textMuted">
              {formatCoords(draft.latitude, draft.longitude)}
            </Text>
            {draft.weather ? (
              <Chip
                tone="primary"
                label={`${weatherCodeToInfo(draft.weather.weatherCode).emoji} ${formatTemperature(
                  draft.weather.temperatureC,
                  units,
                )}`}
              />
            ) : null}
          </View>
        ) : (
          <Text variant="bodyMuted" style={styles.locationHint}>
            Tag where this trip happened.
          </Text>
        )}
        <Button
          title={hasLocation ? 'Update location' : 'Use current location'}
          variant="secondary"
          loading={locating}
          onPress={handleLocate}
        />
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
  photoEmoji: { fontSize: 44 },
  photoButtons: { flexDirection: 'row', gap: Spacing.md },
  notes: { minHeight: 96, textAlignVertical: 'top', paddingTop: Spacing.sm },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  locationInfo: { gap: Spacing.xs, marginVertical: Spacing.sm },
  locationHint: { marginVertical: Spacing.sm },
});
