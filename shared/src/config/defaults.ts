import { colors } from '../theme/colors';
import type { AppBranding, AppLogos, AppSettings, AppTheme } from '../types';

export const DEFAULT_BRANDING: AppBranding = {
  appName: 'GetMeRide',
  driverAppName: 'GetMeRide Driver',
  adminTitle: 'GetMeRide Admin',
  tagline: 'Your Ride, Your Way',
  customerSubtitle: 'Book rides across your city',
  driverSubtitle: 'Earn on your schedule',
  supportEmail: 'support@getmeride.app',
};

export const DEFAULT_THEME: AppTheme = {
  primary: colors.primary,
  primaryDark: colors.primaryDark,
  accent: colors.accent,
  buttonPrimary: colors.buttonPrimary,
  buttonPrimaryText: colors.buttonPrimaryText,
  background: colors.background,
  surface: colors.surface,
  textPrimary: colors.textPrimary,
  textMuted: colors.textMuted,
  borderFocused: colors.borderFocused,
  borderDefault: colors.borderDefault,
  danger: colors.danger,
  warning: colors.warning,
};

export const DEFAULT_LOGOS: AppLogos = {
  logoUrl: '',
  iconUrl: '',
  appIconUrl: '',
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  requestRadiusKm: 10,
  branding: DEFAULT_BRANDING,
  theme: DEFAULT_THEME,
  logos: DEFAULT_LOGOS,
};
