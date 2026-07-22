import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#0A2540',
    secondary: '#2C5234',
    accent: '#D4A373',
    background: '#FAF8F5',
    border: '#E5E1D8',
    text: '#0A2540',
    textSecondary: '#6B7280',
    card: '#FFFFFF',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
  dark: {
    primary: '#0A2540',
    secondary: '#2C5234',
    accent: '#D4A373',
    background: '#0F172A', // slate-900
    border: '#334155', // slate-700
    text: '#F8FAFC', // slate-50
    textSecondary: '#94A3B8', // slate-400
    card: '#1E293B', // slate-800
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Courier',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 64,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
