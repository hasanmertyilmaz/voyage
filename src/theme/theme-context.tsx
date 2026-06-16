import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { Colors, type ColorScheme, type ThemeColors } from '@/constants/theme';
import { useAppSelector } from '@/store/hooks';
import { selectThemePreference } from '@/store/slices/settingsSlice';

export interface ThemeContextValue {
  colors: ThemeColors;
  scheme: ColorScheme;
  isDark: boolean;
}

// A light default means components that read the theme still render correctly
// when no provider is mounted (e.g. in isolated component tests).
const defaultValue: ThemeContextValue = {
  colors: Colors.light,
  scheme: 'light',
  isDark: false,
};

const ThemeContext = createContext<ThemeContextValue>(defaultValue);

/**
 * Resolves the active palette from the user's saved preference combined with
 * the OS color scheme, and exposes it to the tree through context.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const preference = useAppSelector(selectThemePreference);

  const value = useMemo<ThemeContextValue>(() => {
    const scheme: ColorScheme =
      preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
    return { colors: Colors[scheme], scheme, isDark: scheme === 'dark' };
  }, [preference, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}
