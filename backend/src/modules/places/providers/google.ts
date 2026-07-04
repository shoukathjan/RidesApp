import { Coordinates, PlaceSuggestion } from '@useme/shared';
import { env } from '../../../config/env';

interface GooglePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
}

interface GoogleAutocompleteResponse {
  predictions?: GooglePrediction[];
  status: string;
}

interface GoogleDetailsResponse {
  result?: {
    place_id: string;
    formatted_address?: string;
    geometry?: { location?: { lat: number; lng: number } };
    address_components?: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  };
  status: string;
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

function parseAddressComponents(
  components: AddressComponent[] | undefined,
): { locality?: string; city?: string; state?: string } {
  if (!components || !Array.isArray(components)) return {};
  let locality: string | undefined;
  let city: string | undefined;
  let state: string | undefined;
  for (const c of components) {
    if (c.types.includes('locality')) city = c.long_name;
    if (c.types.includes('sublocality') || c.types.includes('neighborhood')) {
      locality = c.long_name;
    }
    if (c.types.includes('administrative_area_level_1')) state = c.long_name;
    if (c.types.includes('administrative_area_level_3') && !locality) {
      locality = c.long_name;
    }
  }
  return { locality, city, state };
}

async function googleGet<T>(url: URL): Promise<T> {
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Google Places error ${res.status}`);
  return res.json() as Promise<T>;
}

async function fetchPlaceDetails(placeId: string): Promise<PlaceSuggestion | null> {
  const key = env.places.googleApiKey;
  if (!key) return null;
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set(
    'fields',
    'place_id,formatted_address,geometry,address_components,name',
  );
  url.searchParams.set('key', key);
  const data = await googleGet<GoogleDetailsResponse>(url);
  if (data.status !== 'OK' || !data.result?.geometry?.location) return null;
  const loc = data.result.geometry.location;
  const { locality, city, state } = parseAddressComponents(data.result.address_components);
  const label =
    (data.result as { name?: string }).name ??
    data.result.formatted_address?.split(',')[0] ??
    'Selected place';
  return {
    id: `google:${data.result.place_id}`,
    label,
    subtitle: data.result.formatted_address,
    coordinates: { lat: loc.lat, lng: loc.lng },
    source: 'google',
    locality,
    city,
    state,
  };
}

export async function searchGoogle(
  query: string,
  bias?: Coordinates,
  limit = 5,
): Promise<PlaceSuggestion[]> {
  const key = env.places.googleApiKey;
  if (!key) return [];

  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
  url.searchParams.set('input', query);
  url.searchParams.set('key', key);
  url.searchParams.set('components', 'country:in');
  if (bias) {
    url.searchParams.set('location', `${bias.lat},${bias.lng}`);
    url.searchParams.set('radius', '50000');
  }

  const data = await googleGet<GoogleAutocompleteResponse>(url);
  if (data.status !== 'OK' || !data.predictions?.length) return [];

  const top = data.predictions.slice(0, limit);
  const details = await Promise.all(
    top.map((p) => fetchPlaceDetails(p.place_id)),
  );
  return details.filter((d): d is PlaceSuggestion => d !== null);
}

export async function reverseGoogle(coords: Coordinates): Promise<PlaceSuggestion | null> {
  const key = env.places.googleApiKey;
  if (!key) return null;
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('latlng', `${coords.lat},${coords.lng}`);
  url.searchParams.set('key', key);
  const data = await googleGet<{
    results?: Array<{
      place_id: string;
      formatted_address: string;
      geometry: { location: { lat: number; lng: number } };
      address_components?: AddressComponent[];
    }>;
    status: string;
  }>(url);
  if (data.status !== 'OK' || !data.results?.[0]) return null;
  const r = data.results[0];
  const { locality, city, state } = parseAddressComponents(r.address_components);
  return {
    id: `google:${r.place_id}`,
    label: r.formatted_address.split(',')[0] ?? 'Current location',
    subtitle: r.formatted_address,
    coordinates: { lat: r.geometry.location.lat, lng: r.geometry.location.lng },
    source: 'google',
    locality,
    city,
    state,
  };
}
