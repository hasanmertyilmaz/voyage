import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';

import { weatherApi } from './api/weatherApi';
import authReducer from './slices/authSlice';
import entriesReducer from './slices/entriesSlice';
import settingsReducer, {
  SETTINGS_STORAGE_KEY,
  setRemindersEnabled,
  setThemePreference,
  setUnits,
  type SettingsState,
} from './slices/settingsSlice';

/**
 * Listener middleware that persists user settings to AsyncStorage whenever they
 * change, so the theme/units/reminder preferences survive app restarts.
 */
const listenerMiddleware = createListenerMiddleware();
listenerMiddleware.startListening({
  matcher: isAnyOf(setThemePreference, setUnits, setRemindersEnabled),
  effect: async (_action, api) => {
    const { settings } = api.getState() as { settings: SettingsState };
    try {
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          themePreference: settings.themePreference,
          units: settings.units,
          remindersEnabled: settings.remindersEnabled,
        }),
      );
    } catch {
      // Persisting preferences is best-effort.
    }
  },
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    entries: entriesReducer,
    settings: settingsReducer,
    [weatherApi.reducerPath]: weatherApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(listenerMiddleware.middleware)
      .concat(weatherApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
