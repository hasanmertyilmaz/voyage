import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemePreference = 'system' | 'light' | 'dark';
export type Units = 'metric' | 'imperial';

export interface SettingsState {
  themePreference: ThemePreference;
  units: Units;
  remindersEnabled: boolean;
  /** True once persisted settings have been read back on launch. */
  hydrated: boolean;
}

const initialState: SettingsState = {
  themePreference: 'system',
  units: 'metric',
  remindersEnabled: false,
  hydrated: false,
};

export const SETTINGS_STORAGE_KEY = 'voyage.settings';

export const loadSettings = createAsyncThunk('settings/load', async () => {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<SettingsState>) : {};
  } catch {
    return {};
  }
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemePreference(state, action: PayloadAction<ThemePreference>) {
      state.themePreference = action.payload;
    },
    setUnits(state, action: PayloadAction<Units>) {
      state.units = action.payload;
    },
    setRemindersEnabled(state, action: PayloadAction<boolean>) {
      state.remindersEnabled = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadSettings.fulfilled, (state, action) => {
      const { themePreference, units, remindersEnabled } = action.payload;
      if (themePreference) state.themePreference = themePreference;
      if (units) state.units = units;
      if (typeof remindersEnabled === 'boolean') state.remindersEnabled = remindersEnabled;
      state.hydrated = true;
    });
  },
});

export const { setThemePreference, setUnits, setRemindersEnabled } = settingsSlice.actions;
export default settingsSlice.reducer;

export const selectSettings = (state: { settings: SettingsState }) => state.settings;
export const selectUnits = (state: { settings: SettingsState }) => state.settings.units;
export const selectThemePreference = (state: { settings: SettingsState }) =>
  state.settings.themePreference;
export const selectRemindersEnabled = (state: { settings: SettingsState }) =>
  state.settings.remindersEnabled;
