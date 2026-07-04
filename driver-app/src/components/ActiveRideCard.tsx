import { BookingStatusLabel, DriverActiveRideSummary } from '@useme/shared';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme';
import { PrimaryButton } from '../theme/components';

type Props = {
  ride: DriverActiveRideSummary;
  onManage: () => void;
  expanded?: boolean;
};

export function ActiveRideCard({ ride, onManage, expanded = false }: Props) {
  const scheduled = new Date(ride.scheduledAt).toLocaleString();

  return (
    <View style={[styles.card, expanded && styles.cardExpanded]}>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Active ride</Text>
        </View>
        <Text style={styles.status}>{BookingStatusLabel[ride.status]}</Text>
      </View>

      <Text style={styles.fare}>₹{ride.fareEstimate}</Text>
      <Text style={styles.meta}>Scheduled · {scheduled}</Text>

      <View style={styles.routeBlock}>
        <Text style={styles.routeLabel}>Pickup</Text>
        <Text style={styles.routeValue}>{ride.pickup.address ?? 'Pickup location'}</Text>
        <Text style={[styles.routeLabel, styles.routeLabelSpaced]}>Drop</Text>
        <Text style={styles.routeValue}>
          {ride.destination.address ?? 'Destination'}
        </Text>
      </View>

      {expanded ? (
        <Text style={styles.hint}>
          Finish this ride before you can accept new requests.
        </Text>
      ) : null}

      <PrimaryButton
        title={expanded ? 'Manage ride' : 'Resume ride'}
        onPress={onManage}
        compact={!expanded}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: `${colors.warning}12`,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardExpanded: {
    margin: spacing.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  badgeText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: typography.caption,
  },
  status: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: typography.body,
  },
  fare: {
    fontSize: typography.title,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.body,
  },
  routeBlock: {
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  routeLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  routeLabelSpaced: {
    marginTop: spacing.sm,
  },
  routeValue: {
    color: colors.textPrimary,
    fontSize: typography.body,
    marginTop: 2,
    lineHeight: 20,
  },
  hint: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 20,
  },
});
