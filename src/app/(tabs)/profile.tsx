import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useHaptics } from '@/hooks/useHaptics';
import { cancelAllReminders, scheduleTripReminder } from '@/services/notifications';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAuthUser, signOut } from '@/store/slices/authSlice';
import { selectEntries } from '@/store/slices/entriesSlice';
import {
  selectRemindersEnabled,
  selectThemePreference,
  selectUnits,
  setRemindersEnabled,
  setThemePreference,
  setUnits,
  type ThemePreference,
  type Units,
} from '@/store/slices/settingsSlice';
import { useThemeContext } from '@/theme/theme-context';

function SegmentedRow({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.segment}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option)}
            style={[styles.segmentItem, { backgroundColor: active ? theme.primary : theme.surfaceAlt }]}
          >
            <Text
              variant="caption"
              style={{
                color: active ? theme.onPrimary : theme.textSecondary,
                fontWeight: '700',
                textTransform: 'capitalize',
              }}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { gradients } = useThemeContext();
  const insets = useSafeAreaInsets();
  const { selection } = useHaptics();

  const user = useAppSelector(selectAuthUser);
  const entries = useAppSelector(selectEntries);
  const themePreference = useAppSelector(selectThemePreference);
  const units = useAppSelector(selectUnits);
  const remindersEnabled = useAppSelector(selectRemindersEnabled);

  const stats = useMemo(() => {
    const places = new Set(entries.map((entry) => entry.placeName).filter(Boolean));
    return { trips: entries.length, places: places.size };
  }, [entries]);

  const onToggleReminders = async (value: boolean) => {
    selection();
    dispatch(setRemindersEnabled(value));
    if (value) {
      const id = await scheduleTripReminder(3, "It's been a while — add your latest trip!");
      if (!id) {
        Alert.alert('Notifications off', 'Enable notifications in Settings to receive reminders.');
        dispatch(setRemindersEnabled(false));
      }
    } else {
      await cancelAllReminders();
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + Spacing.xl }]}
        >
          <Avatar email={user?.email} size={76} />
          <Text style={styles.email}>{user?.email ?? 'Traveler'}</Text>
          <Text style={styles.member}>Voyager</Text>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text variant="display">{stats.trips}</Text>
              <Text variant="bodyMuted">Trips</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text variant="display">{stats.places}</Text>
              <Text variant="bodyMuted">Places</Text>
            </Card>
          </View>

          <Card>
            <Text variant="label" color="textSecondary">
              Appearance
            </Text>
            <SegmentedRow
              options={['system', 'light', 'dark']}
              value={themePreference}
              onChange={(value) => {
                selection();
                dispatch(setThemePreference(value as ThemePreference));
              }}
            />
          </Card>

          <Card>
            <Text variant="label" color="textSecondary">
              Units
            </Text>
            <SegmentedRow
              options={['metric', 'imperial']}
              value={units}
              onChange={(value) => {
                selection();
                dispatch(setUnits(value as Units));
              }}
            />
          </Card>

          <Card>
            <View style={styles.switchRow}>
              <View style={styles.flex}>
                <Text variant="body">Trip reminders</Text>
                <Text variant="caption" color="textMuted">
                  A local notification nudging you to keep journaling.
                </Text>
              </View>
              <Switch
                value={remindersEnabled}
                onValueChange={onToggleReminders}
                trackColor={{ true: theme.primary, false: theme.border }}
              />
            </View>
          </Card>

          <Button title="Sign out" variant="danger" onPress={() => dispatch(signOut())} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: Spacing.xxl },
  hero: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  email: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  member: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  body: { padding: Spacing.lg, gap: Spacing.lg, marginTop: -Spacing.lg },
  statsRow: { flexDirection: 'row', gap: Spacing.lg },
  statCard: { flex: 1, alignItems: 'center' },
  segment: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, borderRadius: Radius.md },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
});
