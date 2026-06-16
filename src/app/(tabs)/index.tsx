import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { FlatList, Platform, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GradientHeader } from '@/components/GradientHeader';
import { SwipeableEntryCard } from '@/components/SwipeableEntryCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { Text } from '@/components/ui/Text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useThemeContext } from '@/theme/theme-context';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import {
  hydrateFromCache,
  loadEntries,
  removeEntry,
  selectEntries,
  selectEntriesError,
  selectEntriesStatus,
  selectFromCache,
} from '@/store/slices/entriesSlice';
import { selectUnits } from '@/store/slices/settingsSlice';
import type { Entry } from '@/types/entry';

export default function JournalScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const theme = useTheme();
  const { gradients } = useThemeContext();

  const user = useAppSelector(selectAuthUser);
  const entries = useAppSelector(selectEntries);
  const status = useAppSelector(selectEntriesStatus);
  const error = useAppSelector(selectEntriesError);
  const fromCache = useAppSelector(selectFromCache);
  const units = useAppSelector(selectUnits);

  const load = useCallback(() => {
    if (user) dispatch(loadEntries(user.id));
  }, [dispatch, user]);

  useEffect(() => {
    if (!user) return;
    dispatch(hydrateFromCache(user.id));
    dispatch(loadEntries(user.id));
  }, [dispatch, user]);

  const openEntry = useCallback((entry: Entry) => router.push(`/entry/${entry.id}`), [router]);
  const handleDelete = useCallback(
    (entry: Entry) => {
      if (user) dispatch(removeEntry({ userId: user.id, entry }));
    },
    [dispatch, user],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Entry; index: number }) => (
      <Animated.View entering={FadeInDown.duration(320).delay(Math.min(index, 8) * 45)}>
        <SwipeableEntryCard entry={item} units={units} onPress={openEntry} onDelete={handleDelete} />
      </Animated.View>
    ),
    [units, openEntry, handleDelete],
  );

  const tripLabel = `${entries.length} ${entries.length === 1 ? 'trip' : 'trips'} logged`;

  if (status === 'loading' && entries.length === 0) {
    return <Loading label="Loading your trips…" />;
  }
  if (status === 'failed' && entries.length === 0) {
    return <ErrorState message={error ?? 'Could not load your trips.'} onRetry={load} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title="Voyage" subtitle={tripLabel} />
      {fromCache ? (
        <Text variant="caption" color="textMuted" style={styles.cacheNote}>
          Showing saved trips (offline)
        </Text>
      ) : null}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={entries.length === 0 ? styles.emptyContent : styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={status === 'loading' && entries.length > 0}
            onRefresh={load}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No trips yet"
            message="Tap the + button to capture your first travel memory."
            actionLabel="Add a trip"
            onAction={() => router.push('/modal/new')}
          />
        }
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={10}
        removeClippedSubviews={Platform.OS === 'android'}
        showsVerticalScrollIndicator={false}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add a trip"
        onPress={() => router.push('/modal/new')}
        style={({ pressed }) => [styles.fab, { transform: [{ scale: pressed ? 0.94 : 1 }] }]}
      >
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabFill}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cacheNote: { textAlign: 'center', paddingVertical: Spacing.xs },
  listContent: { padding: Spacing.lg, paddingBottom: 110 },
  emptyContent: { flexGrow: 1, padding: Spacing.lg },
  separator: { height: Spacing.lg },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.xl,
    borderRadius: 30,
    shadowColor: '#0D9488',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabFill: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
