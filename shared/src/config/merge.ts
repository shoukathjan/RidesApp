import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_BRANDING,
  DEFAULT_LOGOS,
  DEFAULT_THEME,
} from './defaults';
import type { AppBranding, AppLogos, AppSettings, AppTheme } from '../types';

function pickBranding(partial?: Partial<AppBranding> | Record<string, unknown>): AppBranding {
  if (!partial) return { ...DEFAULT_BRANDING };
  return {
    appName: typeof partial.appName === 'string' ? partial.appName : DEFAULT_BRANDING.appName,
    driverAppName:
      typeof partial.driverAppName === 'string'
        ? partial.driverAppName
        : DEFAULT_BRANDING.driverAppName,
    adminTitle:
      typeof partial.adminTitle === 'string' ? partial.adminTitle : DEFAULT_BRANDING.adminTitle,
    tagline: typeof partial.tagline === 'string' ? partial.tagline : DEFAULT_BRANDING.tagline,
    customerSubtitle:
      typeof partial.customerSubtitle === 'string'
        ? partial.customerSubtitle
        : DEFAULT_BRANDING.customerSubtitle,
    driverSubtitle:
      typeof partial.driverSubtitle === 'string'
        ? partial.driverSubtitle
        : DEFAULT_BRANDING.driverSubtitle,
    supportEmail:
      typeof partial.supportEmail === 'string'
        ? partial.supportEmail
        : DEFAULT_BRANDING.supportEmail,
  };
}

function pickTheme(partial?: Partial<AppTheme> | Record<string, unknown>): AppTheme {
  if (!partial) return { ...DEFAULT_THEME };
  const result = { ...DEFAULT_THEME };
  for (const key of Object.keys(DEFAULT_THEME) as (keyof AppTheme)[]) {
    const value = partial[key];
    if (typeof value === 'string') result[key] = value;
  }
  return result;
}

function pickLogos(partial?: Partial<AppLogos> | Record<string, unknown>): AppLogos {
  if (!partial) return { ...DEFAULT_LOGOS };
  return {
    logoUrl: typeof partial.logoUrl === 'string' ? partial.logoUrl : DEFAULT_LOGOS.logoUrl,
    iconUrl: typeof partial.iconUrl === 'string' ? partial.iconUrl : DEFAULT_LOGOS.iconUrl,
    appIconUrl:
      typeof partial.appIconUrl === 'string' ? partial.appIconUrl : DEFAULT_LOGOS.appIconUrl,
  };
}

/** Merge partial API / DB payload with compile-time defaults. */
export function normalizeAppSettings(partial?: Partial<AppSettings> | null): AppSettings {
  if (!partial) return { ...DEFAULT_APP_SETTINGS };

  return {
    requestRadiusKm:
      typeof partial.requestRadiusKm === 'number'
        ? partial.requestRadiusKm
        : DEFAULT_APP_SETTINGS.requestRadiusKm,
    branding: pickBranding(partial.branding),
    theme: pickTheme(partial.theme),
    logos: pickLogos(partial.logos),
  };
}

/** Map theme tokens to admin-web CSS custom properties. */
export function themeToCssVariables(theme: AppTheme): Record<string, string> {
  return {
    '--color-brand-500': theme.primary,
    '--color-brand-600': theme.primaryDark,
    '--color-brand-700': theme.primaryDark,
    '--color-brand-900': theme.primaryDark,
    '--color-accent-400': theme.accent,
    '--color-accent-500': theme.accent,
    '--color-accent-600': theme.accent,
  };
}
