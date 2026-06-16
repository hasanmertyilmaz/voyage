import type { ThemeColors } from '@/constants/theme';
import { useThemeContext } from '@/theme/theme-context';

export function useTheme(): ThemeColors {
  return useThemeContext().colors;
}
