import { Coordinates, PlaceSuggestion } from '@useme/shared';
import { cacheKey, getCached, setCached } from './cache';
import { searchGoogle, reverseGoogle } from './providers/google';
import { reverseNominatim, searchNominatim } from './providers/nominatim';
import { dedupeSuggestions, rankSuggestions, routeQuery } from './queryRouter';

const AUTOCOMPLETE_TTL_MS = 5 * 60 * 1000;
const REVERSE_TTL_MS = 30 * 60 * 1000;
const MIN_OSM_RESULTS = 3;
const MAX_RESULTS = 8;

function parseBias(lat?: string, lng?: string): Coordinates | undefined {
  const la = Number(lat);
  const ln = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return undefined;
  return { lat: la, lng: ln };
}

export async function autocomplete(
  query: string,
  lat?: string,
  lng?: string,
): Promise<PlaceSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const bias = parseBias(lat, lng);
  const key = cacheKey({
    ac: q.toLowerCase(),
    lat: bias ? bias.lat.toFixed(2) : undefined,
    lng: bias ? bias.lng.toFixed(2) : undefined,
  });
  const cached = getCached<PlaceSuggestion[]>(key);
  if (cached) return cached;

  const strategy = routeQuery(q);
  let results: PlaceSuggestion[] = [];

  if (strategy === 'google_first') {
    const google = await searchGoogle(q, bias, MAX_RESULTS);
    results = google;
    if (results.length < MIN_OSM_RESULTS) {
      const osm = await searchNominatim(q, bias, MAX_RESULTS);
      results = dedupeSuggestions([...results, ...osm]);
    }
  } else {
    const osm = await searchNominatim(q, bias, MAX_RESULTS);
    results = osm;
    if (results.length < MIN_OSM_RESULTS) {
      const google = await searchGoogle(q, bias, MAX_RESULTS);
      results = dedupeSuggestions([...results, ...google]);
    }
  }

  results = rankSuggestions(dedupeSuggestions(results), q, bias).slice(0, MAX_RESULTS);
  setCached(key, results, AUTOCOMPLETE_TTL_MS);
  return results;
}

export async function reverseGeocode(
  lat: string,
  lng: string,
): Promise<PlaceSuggestion | null> {
  const bias = parseBias(lat, lng);
  if (!bias) return null;

  const key = cacheKey({
    rev: `${bias.lat.toFixed(4)},${bias.lng.toFixed(4)}`,
  });
  const cached = getCached<PlaceSuggestion>(key);
  if (cached) return cached;

  let result = await reverseNominatim(bias);
  if (!result) {
    result = await reverseGoogle(bias);
  }

  if (result) setCached(key, result, REVERSE_TTL_MS);
  return result;
}
