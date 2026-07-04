import { Coordinates, PlaceSuggestion } from '@useme/shared';
import { api } from '../api/client';

export interface SelectedPlace {
  address?: string;
  coordinates: Coordinates;
  locality?: string;
  city?: string;
  state?: string;
  label: string;
}

export function suggestionToPlace(s: PlaceSuggestion): SelectedPlace {
  return {
    label: s.label,
    address: s.subtitle ?? s.label,
    coordinates: s.coordinates,
    locality: s.locality,
    city: s.city,
    state: s.state,
  };
}

export async function searchPlaces(
  query: string,
  bias?: Coordinates,
): Promise<PlaceSuggestion[]> {
  const params: Record<string, string> = { q: query };
  if (bias) {
    params.lat = String(bias.lat);
    params.lng = String(bias.lng);
  }
  const { data } = await api.get<PlaceSuggestion[]>('/places/autocomplete', { params });
  return data;
}

export async function reverseGeocodePlace(coords: Coordinates): Promise<SelectedPlace> {
  const { data } = await api.get<PlaceSuggestion>('/places/reverse', {
    params: { lat: coords.lat, lng: coords.lng },
  });
  return suggestionToPlace(data);
}
