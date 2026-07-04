import { Coordinates, PlaceSuggestion } from '@useme/shared';

const POI_KEYWORDS = [
  'airport',
  'hospital',
  'mall',
  'station',
  'railway',
  'bus stand',
  'bus stop',
  'hotel',
  'restaurant',
  'cafe',
  'temple',
  'church',
  'mosque',
  'college',
  'university',
  'school',
  'metro',
  'bazaar',
  'market',
  'park',
  'stadium',
];

const MAJOR_CITIES = [
  'hyderabad',
  'bangalore',
  'bengaluru',
  'mumbai',
  'delhi',
  'chennai',
  'kolkata',
  'pune',
  'ahmedabad',
  'jaipur',
  'lucknow',
  'kochi',
  'visakhapatnam',
  'vizag',
  'vijayawada',
  'warangal',
  'nagpur',
  'indore',
  'bhopal',
  'chandigarh',
  'gurgaon',
  'gurugram',
  'noida',
];

export type QueryRoute = 'osm_first' | 'google_first';

export function routeQuery(query: string): QueryRoute {
  const lower = query.toLowerCase().trim();
  if (!lower) return 'osm_first';
  if (POI_KEYWORDS.some((k) => lower.includes(k))) return 'google_first';
  if (MAJOR_CITIES.some((c) => lower === c || lower.startsWith(`${c} `))) {
    return 'google_first';
  }
  return 'osm_first';
}

export function haversineMeters(a: Coordinates, b: Coordinates): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function dedupeSuggestions(
  items: PlaceSuggestion[],
  minDistanceM = 100,
): PlaceSuggestion[] {
  const kept: PlaceSuggestion[] = [];
  for (const item of items) {
    const dup = kept.find(
      (k) =>
        haversineMeters(k.coordinates, item.coordinates) < minDistanceM &&
        normalizeLabel(k.label) === normalizeLabel(item.label),
    );
    if (!dup) kept.push(item);
  }
  return kept;
}

function normalizeLabel(label: string): string {
  return label.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function rankSuggestions(
  items: PlaceSuggestion[],
  query: string,
  bias?: Coordinates,
): PlaceSuggestion[] {
  const q = query.toLowerCase().trim();
  return [...items].sort((a, b) => score(b, q, bias) - score(a, q, bias));
}

function score(item: PlaceSuggestion, q: string, bias?: Coordinates): number {
  const label = item.label.toLowerCase();
  let s = 0;
  if (label === q) s += 100;
  else if (label.startsWith(q)) s += 80;
  else if (label.includes(q)) s += 50;
  if (bias) {
    const distKm = haversineMeters(bias, item.coordinates) / 1000;
    s += Math.max(0, 30 - distKm);
  }
  return s;
}
