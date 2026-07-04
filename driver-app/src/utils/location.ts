import { Coordinates } from '@useme/shared';
import * as Location from 'expo-location';

/**
 * One-shot GPS snapshot. Captured on Go Online and when refreshing the ride
 * requests feed, then sent to the backend purely for radius filtering. There is
 * no continuous tracking and the location is never streamed anywhere.
 */
export async function getCurrentCoordinates(): Promise<Coordinates | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;
  const pos = await Location.getCurrentPositionAsync({});
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
}
