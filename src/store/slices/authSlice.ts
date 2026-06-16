import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@supabase/supabase-js';

import { supabase } from '@/services/supabase';

export interface AuthUser {
  id: string;
  email: string | null;
}

export interface AuthState {
  /** `initializing` while the persisted session is being restored on launch. */
  status: 'initializing' | 'idle' | 'loading';
  user: AuthUser | null;
  error: string | null;
  /** True after sign-up when the account still needs email confirmation. */
  pendingConfirmation: boolean;
}

const initialState: AuthState = {
  status: 'initializing',
  user: null,
  error: null,
  pendingConfirmation: false,
};

const toAuthUser = (user: User | null | undefined): AuthUser | null =>
  user ? { id: user.id, email: user.email ?? null } : null;

export const restoreSession = createAsyncThunk('auth/restoreSession', async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return toAuthUser(data.session?.user);
});

export const signIn = createAsyncThunk<
  AuthUser,
  { email: string; password: string },
  { rejectValue: string }
>('auth/signIn', async ({ email, password }, { rejectWithValue }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) return rejectWithValue(error.message);
  const user = toAuthUser(data.user);
  if (!user) return rejectWithValue('Sign in failed.');
  return user;
});

export const signUp = createAsyncThunk<
  { user: AuthUser | null; needsConfirmation: boolean },
  { email: string; password: string },
  { rejectValue: string }
>('auth/signUp', async ({ email, password }, { rejectWithValue }) => {
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
  if (error) return rejectWithValue(error.message);
  return { user: toAuthUser(data.user), needsConfirmation: !data.session };
});

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await supabase.auth.signOut();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Synced from supabase.auth.onAuthStateChange (token refresh, sign-out). */
    sessionChanged(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      if (state.status === 'initializing') state.status = 'idle';
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.status = 'initializing';
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.status = 'idle';
        state.user = null;
      })
      .addCase(signIn.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload ?? 'Sign in failed.';
      })
      .addCase(signUp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.pendingConfirmation = false;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload.user;
        state.pendingConfirmation = action.payload.needsConfirmation;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload ?? 'Sign up failed.';
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
        state.error = null;
        state.pendingConfirmation = false;
      });
  },
});

export const { sessionChanged, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.user !== null;
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectPendingConfirmation = (state: { auth: AuthState }) =>
  state.auth.pendingConfirmation;
