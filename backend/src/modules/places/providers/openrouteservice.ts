import { Coordinates } from '@useme/shared';
import { env } from '../../../config/env';
import { cacheKey, getCached, setCached } from '../cache';

const DISTANCE_TTL_MS = 60 * 60 * 1000;

interface OrsResponse {
  routes?: Array<{
    summary?: { distance?: number };
  }>;
}

const ORS_TIMEOUT_MS = 4000;

export async function drivingDistanceKm(
  pickup: Coordinates,
  destination: Coordinates,
): Promise<number | null> {
  const key = env.openRouteService.apiKey;
  if (!key) return null;

  const keyCache = cacheKey({
    ors: `${pickup.lat.toFixed(4)},${pickup.lng.toFixed(4)}`,
    to: `${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}`,
  });
  const cached = getCached<number>(keyCache);
  if (cached != null) return cached;

  try {
    const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
      method: 'POST',
      headers: {
        Authorization: key,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        coordinates: [
          [pickup.lng, pickup.lat],
          [destination.lng, destination.lat],
        ],
      }),
      signal: AbortSignal.timeout(ORS_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as OrsResponse;
    const meters = data.routes?.[0]?.summary?.distance;
    if (meters == null || !Number.isFinite(meters)) return null;
    const km = Number((meters / 1000).toFixed(2));
    setCached(keyCache, km, DISTANCE_TTL_MS);
    return km;
  } catch {
    return null;
  }
}
