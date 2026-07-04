import { Coordinates } from '../types';

const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Straight-line (haversine) distance in kilometres between two coordinates.
 * Used for fare estimation and ride-request radius filtering. This is NOT a
 * routing/road distance — there is no maps/routing integration by design.
 */
export function haversineKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(h));
}

export function isWithinRadius(
  a: Coordinates,
  b: Coordinates,
  radiusKm: number,
): boolean {
  return haversineKm(a, b) <= radiusKm;
}
