import reducer, {
  addEntry,
  clearEntries,
  hydrateFromCache,
  loadEntries,
  removeEntry,
} from '@/store/slices/entriesSlice';
import type { Entry } from '@/types/entry';

// Mock the service layer so the slice loads without the Supabase client.
// (Jest hoists these mock calls above the imports at transform time.)
jest.mock('@/services/entriesService', () => ({
  createEntry: jest.fn(),
  updateEntry: jest.fn(),
  deleteEntry: jest.fn(),
  fetchEntries: jest.fn(),
}));
jest.mock('@/services/cache', () => ({
  cacheEntries: jest.fn(() => Promise.resolve()),
  readCachedEntries: jest.fn(() => Promise.resolve([])),
  clearCachedEntries: jest.fn(() => Promise.resolve()),
}));

const sample = (id: string): Entry => ({
  id,
  userId: 'u1',
  title: `Trip ${id}`,
  notes: '',
  latitude: null,
  longitude: null,
  placeName: null,
  photoUrl: null,
  photoPath: null,
  weather: null,
  tripDate: '2026-06-16',
  createdAt: '',
  updatedAt: '',
});

const initial = reducer(undefined, { type: '@@INIT' });

describe('entriesSlice', () => {
  it('starts empty and idle', () => {
    expect(initial.items).toEqual([]);
    expect(initial.status).toBe('idle');
  });

  it('prepends a newly created entry', () => {
    const state = reducer(
      initial,
      addEntry.fulfilled(sample('1'), 'req', { userId: 'u1', draft: {} as never }),
    );
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe('1');
  });

  it('removes an entry by id', () => {
    const populated = { ...initial, items: [sample('1'), sample('2')] };
    const state = reducer(
      populated,
      removeEntry.fulfilled('1', 'req', { userId: 'u1', entry: sample('1') }),
    );
    expect(state.items.map((entry) => entry.id)).toEqual(['2']);
  });

  it('flags data loaded from the offline cache', () => {
    const state = reducer(
      initial,
      loadEntries.fulfilled({ entries: [sample('1')], fromCache: true }, 'req', 'u1'),
    );
    expect(state.fromCache).toBe(true);
    expect(state.items).toHaveLength(1);
  });

  it('records a friendly error on load failure', () => {
    const state = reducer(initial, loadEntries.rejected(new Error('x'), 'req', 'u1', 'Offline'));
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Offline');
  });

  it('hydrates from cache only when the list is empty', () => {
    const fresh = reducer(initial, hydrateFromCache.fulfilled([sample('1')], 'req', 'u1'));
    expect(fresh.items).toHaveLength(1);

    const populated = { ...initial, items: [sample('9')] };
    const unchanged = reducer(populated, hydrateFromCache.fulfilled([sample('1')], 'req', 'u1'));
    expect(unchanged.items.map((entry) => entry.id)).toEqual(['9']);
  });

  it('clears entries on sign-out', () => {
    const populated = { ...initial, items: [sample('1')] };
    expect(reducer(populated, clearEntries()).items).toEqual([]);
  });
});
