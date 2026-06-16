import type { ThemeColors } from '@/constants/theme';
import { useThemeContext } from '@/theme/theme-context';

/** Returns the active color palette for the current (system or chosen) theme. */
export function useTheme(): ThemeColors {
  return useThemeContext().colors;
}
