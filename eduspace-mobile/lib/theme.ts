import { ViewStyle } from 'react-native';

export type Gradient = [string, string, ...string[]];

export interface ThemeTokens {
  isDark: boolean;
  bg: string;
  bgDeep: string;
  surface: string;
  surface2: string;
  fg: string;
  muted: string;
  faint: string;
  border: string;
  indigo: string;
  blue: string;
  violet: string;
  purple: string;
  fuchsia: string;
  green: string;
  emerald: string;
  teal: string;
  amber: string;
  amberText: string;
  red: string;
  rose: string;
  sky: string;
  gradientCta: Gradient;
  gradientBrand: Gradient;
  gradientWord: Gradient;
  gradientHero: Gradient;
  headerBg: string;
  headerBorder: string;
  ringTrack: string;
  cardShadow: ViewStyle;
  cardShadowLg: ViewStyle;
  elev1: ViewStyle;
}

const light: ThemeTokens = {
  isDark: false,
  bg: '#f4f6fb',
  bgDeep: '#f8fafc',
  surface: '#ffffff',
  surface2: '#f3f4f6',
  fg: '#111827',
  muted: '#4b5563',
  faint: '#9ca3af',
  border: '#e5e7eb',
  indigo: '#4f46e5',
  blue: '#2563eb',
  violet: '#7c3aed',
  purple: '#a855f7',
  fuchsia: '#c026d3',
  green: '#22c55e',
  emerald: '#10b981',
  teal: '#0d9488',
  amber: '#f59e0b',
  amberText: '#d97706',
  red: '#ef4444',
  rose: '#f43f5e',
  sky: '#0ea5e9',
  gradientCta: ['#2563eb', '#9333ea'],
  gradientBrand: ['#6366f1', '#a855f7'],
  gradientWord: ['#4f46e5', '#c026d3'],
  gradientHero: ['#1e1b4b', '#312e81', '#6d28d9'],
  headerBg: 'rgba(255,255,255,0.72)',
  headerBorder: 'rgba(124,58,237,0.15)',
  ringTrack: '#e8eaf2',
  cardShadow: {
    shadowColor: 'rgba(124,58,237,0.16)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 4,
  },
  cardShadowLg: {
    shadowColor: 'rgba(124,58,237,0.35)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
  elev1: {
    shadowColor: 'rgba(17,24,39,0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 2,
  },
};

const dark: ThemeTokens = {
  ...light,
  isDark: true,
  bg: '#0b0f19',
  bgDeep: '#0f172a',
  surface: '#111827',
  surface2: '#1f2937',
  fg: '#e5e7eb',
  muted: '#cbd5e1',
  faint: '#94a3b8',
  border: '#1f2933',
  indigo: '#818cf8',
  blue: '#60a5fa',
  violet: '#a78bfa',
  purple: '#c084fc',
  fuchsia: '#e879f9',
  headerBg: 'rgba(15,23,42,0.75)',
  headerBorder: 'rgba(139,92,246,0.25)',
  ringTrack: '#1e2636',
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 4,
  },
  cardShadowLg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
  elev1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 2,
  },
};

export const getTheme = (isDarkMode: boolean): ThemeTokens => (isDarkMode ? dark : light);
