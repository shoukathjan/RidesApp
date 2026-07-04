import { AppSettings } from '@useme/shared';
import { getAppSettings, serializeAppSettings } from '../../models/AppSettings';

export async function getPublicConfig(): Promise<AppSettings> {
  const doc = await getAppSettings();
  return serializeAppSettings(doc);
}
