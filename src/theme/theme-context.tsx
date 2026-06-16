import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import {
  Colors,
  Gradients,
  type ColorScheme,
  type GradientSet,
  type ThemeColors,
} from '@/constants/theme';
import { useAppSelector } from '@/store/hooks';
import { selectThemePreference } from '@/store/slices/settingsSlice';

export interface ThemeContextValue {
  colors: ThemeColors;
  gradients: GradientSet;
  scheme: ColorScheme;
  isDark: boolean;
}

const defaultValue: ThemeContextValue = {
  colors: Colors.light,
  gradients: Gradients.light,
  scheme: 'light',
  isDark: false,
};

const ThemeContext = createContext<ThemeContextValue>(defaultValue);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const preference = useAppSelector(selectThemePreference);

  const value = useMemo<ThemeContextValue>(() => {
    const scheme: ColorScheme =
      preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
    return {
      colors: Colors[scheme],
      gradients: Gradients[scheme],
      scheme,
      isDark: scheme === 'dark',
    };
  }, [preference, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}
