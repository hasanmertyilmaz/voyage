import reducer, { sessionChanged, signIn, signOut } from '@/store/slices/authSlice';

// Jest hoists this above the import, so the slice never loads the real client.
jest.mock('@/services/supabase', () => ({ supabase: { auth: {} } }));

const initial = reducer(undefined, { type: '@@INIT' });

describe('authSlice', () => {
  it('initializes with no user while restoring', () => {
    expect(initial.user).toBeNull();
    expect(initial.status).toBe('initializing');
  });

  it('stores the user when the session changes', () => {
    const state = reducer(initial, sessionChanged({ id: 'u1', email: 'a@b.com' }));
    expect(state.user?.id).toBe('u1');
    expect(state.status).toBe('idle');
  });

  it('stores the user on a successful sign in', () => {
    const state = reducer(
      initial,
      signIn.fulfilled({ id: 'u1', email: 'a@b.com' }, 'req', { email: 'a@b.com', password: 'x' }),
    );
    expect(state.user?.email).toBe('a@b.com');
    expect(state.status).toBe('idle');
  });

  it('records the error message on a failed sign in', () => {
    const state = reducer(
      initial,
      signIn.rejected(new Error('bad'), 'req', { email: 'a', password: 'x' }, 'Invalid login credentials'),
    );
    expect(state.error).toBe('Invalid login credentials');
  });

  it('clears the user on sign out', () => {
    const signedIn = { ...initial, user: { id: 'u1', email: 'a@b.com' }, status: 'idle' as const };
    const state = reducer(signedIn, signOut.fulfilled(undefined, 'req', undefined));
    expect(state.user).toBeNull();
  });
});
