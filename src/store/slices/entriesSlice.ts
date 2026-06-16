import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { cacheEntries, readCachedEntries } from '@/services/cache';
import {
  createEntry,
  deleteEntry,
  fetchEntries,
  updateEntry,
} from '@/services/entriesService';
import type { Entry, EntryDraft, RequestStatus } from '@/types/entry';

export interface EntriesState {
  items: Entry[];
  status: RequestStatus;
  error: string | null;
  /** Separate status for create/update/delete so the list spinner is independent. */
  mutationStatus: RequestStatus;
  /** True when the currently shown items came from the offline cache. */
  fromCache: boolean;
}

const initialState: EntriesState = {
  items: [],
  status: 'idle',
  error: null,
  mutationStatus: 'idle',
  fromCache: false,
};

type SliceState = { entries: EntriesState };

const toMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

/** Instantly show cached entries on launch before the network fetch resolves. */
export const hydrateFromCache = createAsyncThunk('entries/hydrateFromCache', (userId: string) =>
  readCachedEntries(userId),
);

/** Fetch from Supabase; on failure fall back to cached data (offline support). */
export const loadEntries = createAsyncThunk<
  { entries: Entry[]; fromCache: boolean },
  string,
  { rejectValue: string }
>('entries/loadEntries', async (userId, { rejectWithValue }) => {
  try {
    const entries = await fetchEntries(userId);
    await cacheEntries(userId, entries);
    return { entries, fromCache: false };
  } catch (error) {
    const cached = await readCachedEntries(userId);
    if (cached.length > 0) return { entries: cached, fromCache: true };
    return rejectWithValue(toMessage(error, 'Failed to load entries.'));
  }
});

export const addEntry = createAsyncThunk<
  Entry,
  { userId: string; draft: EntryDraft },
  { state: SliceState; rejectValue: string }
>('entries/addEntry', async ({ userId, draft }, { getState, rejectWithValue }) => {
  try {
    const entry = await createEntry(userId, draft);
    await cacheEntries(userId, [entry, ...getState().entries.items]);
    return entry;
  } catch (error) {
    return rejectWithValue(toMessage(error, 'Failed to save entry.'));
  }
});

export const editEntry = createAsyncThunk<
  Entry,
  { userId: string; id: string; draft: EntryDraft },
  { state: SliceState; rejectValue: string }
>('entries/editEntry', async ({ userId, id, draft }, { getState, rejectWithValue }) => {
  try {
    const updated = await updateEntry(userId, id, draft);
    const items = getState().entries.items.map((entry) => (entry.id === id ? updated : entry));
    await cacheEntries(userId, items);
    return updated;
  } catch (error) {
    return rejectWithValue(toMessage(error, 'Failed to update entry.'));
  }
});

export const removeEntry = createAsyncThunk<
  string,
  { userId: string; entry: Entry },
  { state: SliceState; rejectValue: string }
>('entries/removeEntry', async ({ userId, entry }, { getState, rejectWithValue }) => {
  try {
    await deleteEntry(entry);
    const items = getState().entries.items.filter((item) => item.id !== entry.id);
    await cacheEntries(userId, items);
    return entry.id;
  } catch (error) {
    return rejectWithValue(toMessage(error, 'Failed to delete entry.'));
  }
});

const entriesSlice = createSlice({
  name: 'entries',
  initialState,
  reducers: {
    clearEntries(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
      state.fromCache = false;
    },
    clearEntriesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateFromCache.fulfilled, (state, action) => {
        if (state.items.length === 0 && action.payload.length > 0) {
          state.items = action.payload;
          state.fromCache = true;
        }
      })
      .addCase(loadEntries.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadEntries.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.entries;
        state.fromCache = action.payload.fromCache;
      })
      .addCase(loadEntries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to load entries.';
      })
      .addCase(addEntry.pending, (state) => {
        state.mutationStatus = 'loading';
        state.error = null;
      })
      .addCase(addEntry.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items.unshift(action.payload);
      })
      .addCase(addEntry.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload ?? 'Failed to save entry.';
      })
      .addCase(editEntry.pending, (state) => {
        state.mutationStatus = 'loading';
        state.error = null;
      })
      .addCase(editEntry.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        const index = state.items.findIndex((entry) => entry.id === action.payload.id);
        if (index >= 0) state.items[index] = action.payload;
      })
      .addCase(editEntry.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload ?? 'Failed to update entry.';
      })
      .addCase(removeEntry.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(removeEntry.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items = state.items.filter((entry) => entry.id !== action.payload);
      })
      .addCase(removeEntry.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload ?? 'Failed to delete entry.';
      });
  },
});

export const { clearEntries, clearEntriesError } = entriesSlice.actions;
export default entriesSlice.reducer;

export const selectEntries = (state: SliceState) => state.entries.items;
export const selectEntriesStatus = (state: SliceState) => state.entries.status;
export const selectEntriesError = (state: SliceState) => state.entries.error;
export const selectMutationStatus = (state: SliceState) => state.entries.mutationStatus;
export const selectFromCache = (state: SliceState) => state.entries.fromCache;
export const selectEntryById = (id: string) => (state: SliceState) =>
  state.entries.items.find((entry) => entry.id === id);
export const selectEntryCount = (state: SliceState) => state.entries.items.length;
