import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../../theme';
import { PrimaryButton, ScreenHeader } from '../../theme/components';
import { useAccess } from '../../gating/AccessContext';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SubscriptionSuccess'>;

export default function SubscriptionSuccessScreen({ route }: Props) {
  const { refresh } = useAccess();
  const { subscriptionValidUntil, planName, durationDays } = route.params;
  const expiry = new Date(subscriptionValidUntil);

  async function goToRides() {
    await refresh();
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Subscription active" />
      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark" size={72} color={colors.accent} />
        </View>
        <Text style={styles.title}>Payment successful!</Text>
        <Text style={styles.text}>Your {planName} plan is now active.</Text>

        <View style={styles.card}>
          <Row label="Subscription" value="Active" highlight />
          {durationDays ? (
            <Row label="Plan duration" value={`${durationDays} days`} />
          ) : null}
          <Row
            label="Valid until"
            value={expiry.toLocaleString(undefined, {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
            highlight
          />
        </View>
      </View>
      <View style={styles.footer}>
        <PrimaryButton title="Go to ride requests" onPress={goToRides} compact />
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  iconWrap: { alignItems: 'center', marginBottom: spacing.lg },
  title: {
    fontSize: typography.title,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  text: {
    textAlign: 'center',
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowLabel: { color: colors.textMuted, fontSize: typography.body },
  rowValue: { color: colors.textPrimary, fontWeight: '600', fontSize: typography.body },
  rowHighlight: { color: colors.accent, fontWeight: '800' },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
});
