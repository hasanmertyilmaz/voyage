import reducer, {
  loadSettings,
  setRemindersEnabled,
  setThemePreference,
  setUnits,
} from '@/store/slices/settingsSlice';

const initial = reducer(undefined, { type: '@@INIT' });

describe('settingsSlice', () => {
  it('defaults to system theme and metric units', () => {
    expect(initial.themePreference).toBe('system');
    expect(initial.units).toBe('metric');
    expect(initial.hydrated).toBe(false);
  });

  it('updates the theme preference', () => {
    expect(reducer(initial, setThemePreference('dark')).themePreference).toBe('dark');
  });

  it('updates the units', () => {
    expect(reducer(initial, setUnits('imperial')).units).toBe('imperial');
  });

  it('toggles reminders', () => {
    expect(reducer(initial, setRemindersEnabled(true)).remindersEnabled).toBe(true);
  });

  it('hydrates persisted settings and marks itself hydrated', () => {
    const state = reducer(
      initial,
      loadSettings.fulfilled(
        { themePreference: 'light', units: 'imperial', remindersEnabled: true },
        'req',
        undefined,
      ),
    );
    expect(state.themePreference).toBe('light');
    expect(state.units).toBe('imperial');
    expect(state.remindersEnabled).toBe(true);
    expect(state.hydrated).toBe(true);
  });
});
