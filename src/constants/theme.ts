import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    background: '#F4F7FB',
    surface: '#FFFFFF',
    surfaceAlt: '#EEF2F7',
    border: '#E2E8F0',
    primary: '#0D9488',
    primaryDark: '#0F766E',
    onPrimary: '#FFFFFF',
    accent: '#F97316',
    success: '#16A34A',
    danger: '#DC2626',
    warning: '#D97706',
    tabBar: '#FFFFFF',
    overlay: 'rgba(15, 23, 42, 0.45)',
  },
  dark: {
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    background: '#0B1220',
    surface: '#131C2B',
    surfaceAlt: '#1B2536',
    border: '#27324A',
    primary: '#2DD4BF',
    primaryDark: '#14B8A6',
    onPrimary: '#04201E',
    accent: '#FB923C',
    success: '#22C55E',
    danger: '#F87171',
    warning: '#FBBF24',
    tabBar: '#0F172A',
    overlay: 'rgba(2, 6, 23, 0.6)',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColor = keyof typeof Colors.light;

export type ThemeColors = Record<ThemeColor, string>;

type Gradient = readonly [string, string, ...string[]];

export const Gradients = {
  light: {
    hero: ['#0EA5A4', '#0F766E'],
    placeholder: ['#99F6E4', '#2DD4BF'],
    cardOverlay: ['transparent', 'rgba(2,6,23,0.05)', 'rgba(2,6,23,0.82)'],
  },
  dark: {
    hero: ['#115E59', '#0B3B38'],
    placeholder: ['#134E4A', '#0F766E'],
    cardOverlay: ['transparent', 'rgba(2,6,23,0.10)', 'rgba(2,6,23,0.90)'],
  },
} as const;

export type GradientSet = {
  hero: Gradient;
  placeholder: Gradient;
  cardOverlay: Gradient;
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 34,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
}) as { sans: string; serif: string; rounded: string; mono: string };
