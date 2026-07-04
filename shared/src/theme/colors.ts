/**
 * Design tokens derived from the provided "Verify number" mockup.
 * Single source of truth for both mobile apps and the admin website.
 */
export const colors = {
  primary: '#1C5E78', // dark teal header
  primaryDark: '#154B61',
  buttonPrimary: '#92C892', // soft green CTA pill ("Next")
  buttonPrimaryText: '#1A3A2A',
  accent: '#34A853', // active green: cursor, focus underline, lock badge
  background: '#FFFFFF',
  surface: '#F5F7F8',
  textPrimary: '#1A1A1A',
  textMuted: '#6B7280',
  borderFocused: '#34A853',
  borderDefault: '#D9DEE2',
  danger: '#D64545',
  warning: '#E0A800',
  white: '#FFFFFF',
} as const;

export type ColorToken = keyof typeof colors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  pill: 999,
} as const;

export const typography = {
  title: 22,
  subtitle: 16,
  body: 14,
  caption: 12,
} as const;
