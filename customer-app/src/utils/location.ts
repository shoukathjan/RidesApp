import { Coordinates } from '@useme/shared';
import * as Location from 'expo-location';

/**
 * One-shot current location for pickup bias and GPS pickup.
 * No continuous tracking and no map rendering by design.
 */
export async function getCurrentCoordinates(): Promise<Coordinates | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;
  const pos = await Location.getCurrentPositionAsync({});
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
}
