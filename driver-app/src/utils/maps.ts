import { Coordinates } from '@useme/shared';
import { Linking } from 'react-native';

/**
 * Open the installed Google Maps app for navigation to the given coordinates.
 * The app intentionally renders NO embedded map — navigation is delegated.
 */
export async function openGoogleMaps(destination: Coordinates): Promise<void> {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`;
  const supported = await Linking.canOpenURL(url);
  if (supported) await Linking.openURL(url);
}
