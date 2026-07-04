import { Coordinates, PlaceSuggestion } from '@useme/shared';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, radii, spacing, typography } from '../theme';
import { shadowSm } from '../theme/shadows';
import { loadRecentPlaces, saveRecentPlace } from '../utils/recentPlaces';
import { searchPlaces, SelectedPlace, suggestionToPlace } from '../utils/places';

interface AddressSearchInputProps {
  placeholder: string;
  value: SelectedPlace | null;
  onChange: (place: SelectedPlace | null) => void;
  bias?: Coordinates | null;
  showRecents?: boolean;
  autoFocus?: boolean;
}

export default function AddressSearchInput({
  placeholder,
  value,
  onChange,
  bias,
  showRecents = true,
  autoFocus = false,
}: AddressSearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceSuggestion[]>([]);
  const [recents, setRecents] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!showRecents) return;
    loadRecentPlaces().then(setRecents);
  }, [showRecents]);

  useEffect(() => {
    if (!value) {
      setQuery('');
      setResults([]);
    }
  }, [value]);

  const runSearch = useCallback(
    async (q: string) => {
      if (q.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const items = await searchPlaces(q, bias ?? undefined);
        setResults(items);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [bias],
  );

  function onQueryChange(text: string) {
    setQuery(text);
    if (value) onChange(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(text), 300);
  }

  async function selectSuggestion(s: PlaceSuggestion) {
    await saveRecentPlace(s);
    if (showRecents) setRecents(await loadRecentPlaces());
    const place = suggestionToPlace(s);
    onChange(place);
    setQuery('');
    setResults([]);
    setFocused(false);
  }

  function clearSelection() {
    onChange(null);
    setQuery('');
    setResults([]);
  }

  const showDropdown =
    focused && !value && (loading || results.length > 0 || (query.length < 2 && recents.length > 0));

  const listData: PlaceSuggestion[] =
    query.trim().length >= 2 ? results : showRecents ? recents : [];

  return (
    <View style={styles.wrap}>
      {value ? (
        <View style={styles.selectedCard}>
          <View style={styles.selectedIcon}>
            <Ionicons name="location" size={20} color={colors.primary} />
          </View>
          <View style={styles.selectedText}>
            <Text style={styles.selectedLabel}>{value.label}</Text>
            {value.address && value.address !== value.label ? (
              <Text style={styles.selectedSub} numberOfLines={2}>
                {value.address}
              </Text>
            ) : null}
          </View>
          <Pressable onPress={clearSelection} hitSlop={8} accessibilityLabel="Clear selection">
            <Ionicons name="close-circle" size={22} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.inputWrap}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={onQueryChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            autoFocus={autoFocus}
            autoCorrect={false}
            returnKeyType="search"
          />
          {loading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
        </View>
      )}

      {showDropdown ? (
        <View style={styles.dropdown}>
          {query.trim().length < 2 && recents.length > 0 ? (
            <Text style={styles.sectionLabel}>Recent places</Text>
          ) : null}
          {query.trim().length >= 2 && !loading && results.length === 0 ? (
            <Text style={styles.empty}>
              No places found. Try a nearby village, landmark, or city name.
            </Text>
          ) : listData.length > 0 ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              style={listData.length > 4 ? styles.listScroll : undefined}
            >
              {listData.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.row}
                  onPress={() => selectSuggestion(item)}
                >
                  <Ionicons name="location-outline" size={18} color={colors.textMuted} />
                  <View style={styles.rowText}>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                    {item.subtitle ? (
                      <Text style={styles.rowSub} numberOfLines={2}>
                        {item.subtitle}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    ...shadowSm,
  },
  searchIcon: { marginRight: spacing.xs },
  input: {
    flex: 1,
    fontSize: typography.subtitle,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.md,
    backgroundColor: `${colors.primary}08`,
    padding: spacing.md,
    ...shadowSm,
  },
  selectedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: { flex: 1 },
  selectedLabel: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  selectedSub: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  dropdown: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  listScroll: { maxHeight: 220 },
  sectionLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderDefault,
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rowSub: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  empty: {
    padding: spacing.md,
    fontSize: typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
