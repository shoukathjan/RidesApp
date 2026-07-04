import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBranding } from '../../config/AppConfigContext';
import { colors, radii, spacing, typography } from '../../theme';
import { PrimaryButton, ScreenHeader } from '../../theme/components';
import { shadowLg, shadowMd, shadowSm } from '../../theme/shadows';
import { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const QUICK_DESTINATIONS = [
  { icon: 'business-outline' as const, label: 'Office' },
  { icon: 'home-outline' as const, label: 'Home' },
  { icon: 'train-outline' as const, label: 'Station' },
];

export default function HomeScreen({ navigation }: Props) {
  const branding = useBranding();

  function openDestinationSearch() {
    navigation.navigate('BookRideFlow', {
      initialStep: 1,
      resetKey: Date.now(),
    });
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={branding.appName} subtitle={branding.customerSubtitle} />
      <SafeAreaView style={styles.body} edges={['bottom']}>
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={14} color={colors.accent} />
            <Text style={styles.heroBadgeText}>Fast · Simple · Local</Text>
          </View>
          <Text style={styles.heading}>Where are you headed?</Text>
          <Text style={styles.subheading}>
            Search your destination and we will match you with a nearby driver.
          </Text>

          <Pressable
            style={[styles.searchBar, shadowLg]}
            onPress={openDestinationSearch}
          >
            <View style={styles.searchIconWrap}>
              <Ionicons name="search" size={20} color={colors.primary} />
            </View>
            <View style={styles.searchTextWrap}>
              <Text style={styles.searchLabel}>Drop location</Text>
              <Text style={styles.searchPlaceholder}>Search village, landmark, or address</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>

          <View style={styles.quickRow}>
            {QUICK_DESTINATIONS.map((item) => (
              <Pressable
                key={item.label}
                style={[styles.quickChip, shadowSm]}
                onPress={openDestinationSearch}
              >
                <Ionicons name={item.icon} size={16} color={colors.primary} />
                <Text style={styles.quickChipText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.bookCard, shadowMd]}>
          <View style={styles.bookCardIcon}>
            <Ionicons name="map-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.bookCardText}>
            <Text style={styles.bookCardTitle}>Full booking</Text>
            <Text style={styles.bookCardSub}>Set pickup, vehicle, and schedule step by step</Text>
          </View>
          <View style={styles.bookBtnWrap}>
            <PrimaryButton
              title="Book"
              onPress={() => navigation.navigate('BookRideFlow', { resetKey: Date.now() })}
              compact
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  body: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    ...shadowMd,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${colors.accent}14`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    marginBottom: spacing.md,
  },
  heroBadgeText: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: colors.accent,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subheading: {
    fontSize: typography.body,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  searchIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchTextWrap: { flex: 1 },
  searchLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  searchPlaceholder: {
    fontSize: typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  quickChipText: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  bookCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookCardText: { flex: 1 },
  bookCardTitle: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bookCardSub: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  bookBtnWrap: {
    minWidth: 88,
  },
});
