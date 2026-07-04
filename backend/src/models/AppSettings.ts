import { AppSettings, DEFAULT_BRANDING, DEFAULT_LOGOS, DEFAULT_THEME, normalizeAppSettings } from '@useme/shared';
import { Schema, model, InferSchemaType, HydratedDocument } from 'mongoose';
import { env } from '../config/env';

const brandingSchema = new Schema(
  {
    appName: { type: String, default: DEFAULT_BRANDING.appName },
    driverAppName: { type: String, default: DEFAULT_BRANDING.driverAppName },
    adminTitle: { type: String, default: DEFAULT_BRANDING.adminTitle },
    tagline: { type: String, default: DEFAULT_BRANDING.tagline },
    customerSubtitle: { type: String, default: DEFAULT_BRANDING.customerSubtitle },
    driverSubtitle: { type: String, default: DEFAULT_BRANDING.driverSubtitle },
    supportEmail: { type: String, default: DEFAULT_BRANDING.supportEmail },
  },
  { _id: false },
);

const themeSchema = new Schema(
  {
    primary: { type: String, default: DEFAULT_THEME.primary },
    primaryDark: { type: String, default: DEFAULT_THEME.primaryDark },
    accent: { type: String, default: DEFAULT_THEME.accent },
    buttonPrimary: { type: String, default: DEFAULT_THEME.buttonPrimary },
    buttonPrimaryText: { type: String, default: DEFAULT_THEME.buttonPrimaryText },
    background: { type: String, default: DEFAULT_THEME.background },
    surface: { type: String, default: DEFAULT_THEME.surface },
    textPrimary: { type: String, default: DEFAULT_THEME.textPrimary },
    textMuted: { type: String, default: DEFAULT_THEME.textMuted },
    borderFocused: { type: String, default: DEFAULT_THEME.borderFocused },
    borderDefault: { type: String, default: DEFAULT_THEME.borderDefault },
    danger: { type: String, default: DEFAULT_THEME.danger },
    warning: { type: String, default: DEFAULT_THEME.warning },
  },
  { _id: false },
);

const logosSchema = new Schema(
  {
    logoUrl: { type: String, default: DEFAULT_LOGOS.logoUrl },
    iconUrl: { type: String, default: DEFAULT_LOGOS.iconUrl },
    appIconUrl: { type: String, default: DEFAULT_LOGOS.appIconUrl },
  },
  { _id: false },
);

/** Singleton document holding global, admin-editable settings and white-label config. */
const appSettingsSchema = new Schema(
  {
    key: { type: String, default: 'global', unique: true },
    requestRadiusKm: { type: Number, default: env.defaultRequestRadiusKm },
    branding: { type: brandingSchema, default: () => ({}) },
    theme: { type: themeSchema, default: () => ({}) },
    logos: { type: logosSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export type AppSettingsDoc = HydratedDocument<InferSchemaType<typeof appSettingsSchema>>;
export const AppSettingsModel = model('AppSettings', appSettingsSchema);

export async function getAppSettings(): Promise<AppSettingsDoc> {
  const existing = await AppSettingsModel.findOne({ key: 'global' });
  if (existing) return existing;
  return AppSettingsModel.create({ key: 'global' });
}

/** Strip Mongoose subdocument internals before sending settings to clients. */
export function serializeAppSettings(doc: AppSettingsDoc): AppSettings {
  const plain = doc.toObject();
  return normalizeAppSettings({
    requestRadiusKm: plain.requestRadiusKm,
    branding: plain.branding ?? DEFAULT_BRANDING,
    theme: plain.theme ?? DEFAULT_THEME,
    logos: plain.logos ?? DEFAULT_LOGOS,
  });
}

