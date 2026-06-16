import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { FlatList, Platform, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { SwipeableEntryCard } from '@/components/SwipeableEntryCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { Text } from '@/components/ui/Text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
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
    dispatch(hydrateFromCache(user.id)); // instant offline render
    dispatch(loadEntries(user.id)); // fresh data
  }, [dispatch, user]);

  const openEntry = useCallback((entry: Entry) => router.push(`/entry/${entry.id}`), [router]);
  const handleDelete = useCallback(
    (entry: Entry) => {
      if (user) dispatch(removeEntry({ userId: user.id, entry }));
    },
    [dispatch, user],
  );

  const renderItem = useCallback(
    ({ item }: { item: Entry }) => (
      <SwipeableEntryCard entry={item} units={units} onPress={openEntry} onDelete={handleDelete} />
    ),
    [units, openEntry, handleDelete],
  );

  if (status === 'loading' && entries.length === 0) {
    return <Loading label="Loading your trips…" />;
  }
  if (status === 'failed' && entries.length === 0) {
    return <ErrorState message={error ?? 'Could not load your trips.'} onRetry={load} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: theme.primary, transform: [{ scale: pressed ? 0.94 : 1 }] },
        ]}
      >
        <Ionicons name="add" size={28} color={theme.onPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cacheNote: { textAlign: 'center', paddingVertical: Spacing.xs },
  listContent: { padding: Spacing.lg, paddingBottom: 96 },
  emptyContent: { flexGrow: 1, padding: Spacing.lg },
  separator: { height: Spacing.lg },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
