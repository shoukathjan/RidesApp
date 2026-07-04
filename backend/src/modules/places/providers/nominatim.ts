import { Coordinates, PlaceSuggestion } from '@useme/shared';
import { env } from '../../../config/env';

interface NominatimAddress {
  village?: string;
  town?: string;
  city?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
  road?: string;
  suburb?: string;
  county?: string;
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type?: string;
  address?: NominatimAddress;
}

function buildViewbox(lat: number, lng: number, delta = 0.5): string {
  const left = lng - delta;
  const right = lng + delta;
  const top = lat + delta;
  const bottom = lat - delta;
  return `${left},${top},${right},${bottom}`;
}

function parseNominatimItem(item: NominatimResult): PlaceSuggestion {
  const addr = item.address ?? {};
  const locality =
    addr.village ?? addr.suburb ?? addr.town ?? addr.county ?? undefined;
  const city = addr.city ?? addr.town ?? addr.state_district ?? undefined;
  const state = addr.state;
  const label =
    item.name ??
    locality ??
    city ??
    item.display_name.split(',')[0]?.trim() ??
    'Unknown place';
  const subtitleParts = [locality, city, state].filter(
    (p, i, arr) => p && arr.indexOf(p) === i && p !== label,
  );
  return {
    id: `osm:${item.place_id}`,
    label,
    subtitle: subtitleParts.length ? subtitleParts.join(', ') : item.display_name,
    coordinates: { lat: Number(item.lat), lng: Number(item.lon) },
    source: 'osm',
    locality,
    city,
    state,
  };
}

async function nominatimFetch(path: string, params: Record<string, string>): Promise<unknown> {
  const url = new URL(`https://nominatim.openstreetmap.org/${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': env.places.userAgent,
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Nominatim error ${res.status}`);
  return res.json();
}

export async function searchNominatim(
  query: string,
  bias?: Coordinates,
  limit = 8,
): Promise<PlaceSuggestion[]> {
  const params: Record<string, string> = {
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: String(limit),
    countrycodes: 'in',
  };
  if (bias) {
    params.viewbox = buildViewbox(bias.lat, bias.lng);
    params.bounded = '0';
    params.lat = String(bias.lat);
    params.lon = String(bias.lng);
  }
  const data = (await nominatimFetch('search', params)) as NominatimResult[];
  if (!Array.isArray(data)) return [];
  return data.map(parseNominatimItem);
}

export async function reverseNominatim(coords: Coordinates): Promise<PlaceSuggestion | null> {
  const data = (await nominatimFetch('reverse', {
    lat: String(coords.lat),
    lon: String(coords.lng),
    format: 'json',
    addressdetails: '1',
    zoom: '18',
  })) as NominatimResult;
  if (!data || !data.lat) return null;
  return parseNominatimItem(data);
}
