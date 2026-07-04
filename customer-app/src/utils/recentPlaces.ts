import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlaceSuggestion } from '@useme/shared';

const KEY = 'useme_recent_places';
const MAX = 5;

export async function loadRecentPlaces(): Promise<PlaceSuggestion[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PlaceSuggestion[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveRecentPlace(place: PlaceSuggestion): Promise<void> {
  const existing = await loadRecentPlaces();
  const filtered = existing.filter((p) => p.id !== place.id);
  const next = [place, ...filtered].slice(0, MAX);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}
