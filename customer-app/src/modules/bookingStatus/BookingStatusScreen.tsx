import {
  BookingStatus,
  BookingStatusLabel,
  CANCELLABLE_STATUSES,
} from '@useme/shared';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { api } from '../../api/client';
import { useHideTabBar } from '../../hooks/useHideTabBar';
import { colors, radii, spacing, typography } from '../../theme';
import { PrimaryButton, ScreenHeader, SurfaceCard } from '../../theme/components';
import { HomeStackParamList } from '../../navigation/types';
import { onBookingStatus } from '../../realtime/socket';

type Props = NativeStackScreenProps<HomeStackParamList, 'BookingStatus'>;

const TIMELINE: BookingStatus[] = [
  BookingStatus.SEARCHING_FOR_DRIVER,
  BookingStatus.DRIVER_ACCEPTED,
  BookingStatus.DRIVER_ARRIVED,
  BookingStatus.RIDE_STARTED,
  BookingStatus.RIDE_COMPLETED,
];

export default function BookingStatusScreen({ route, navigation }: Props) {
  useHideTabBar();

  const { bookingId } = route.params;
  const [status, setStatus] = useState<BookingStatus | null>(null);

  useEffect(() => {
    api.get(`/bookings/${bookingId}`).then((r) => setStatus(r.data.status));
    const off = onBookingStatus((payload) => {
      if (payload.bookingId === bookingId) {
        setStatus(payload.status as BookingStatus);
      }
    });
    return off;
  }, [bookingId]);

  async function cancel() {
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      Alert.alert('Ride cancelled');
      navigation.popToTop();
    } catch {
      Alert.alert('Could not cancel');
    }
  }

  const currentIndex = status ? TIMELINE.indexOf(status) : -1;
  const cancellable = status ? CANCELLABLE_STATUSES.includes(status) : false;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Booking status"
        subtitle={status ? BookingStatusLabel[status] : 'Loading…'}
      />
      <View style={styles.body}>
        <SurfaceCard elevated>
        {status === BookingStatus.RIDE_CANCELLED ? (
          <Text style={styles.cancelled}>This ride was cancelled.</Text>
        ) : (
          TIMELINE.map((s, i) => {
            const done = currentIndex >= i;
            const active = currentIndex === i;
            return (
              <View key={s} style={styles.step}>
                <View style={[styles.dot, done && styles.dotDone, active && styles.dotActive]} />
                <View style={styles.stepContent}>
                  <Text style={[styles.stepText, done && styles.stepTextDone]}>
                    {BookingStatusLabel[s]}
                  </Text>
                  {active && status ? (
                    <Text style={styles.stepActiveHint}>Current status</Text>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
        </SurfaceCard>

        {cancellable && (
          <View style={{ marginTop: spacing.xl }}>
            <PrimaryButton title="Cancel ride" onPress={cancel} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1, padding: spacing.lg },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderDefault,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.borderDefault,
    marginRight: spacing.md,
    marginTop: 2,
  },
  dotDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  dotActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    transform: [{ scale: 1.1 }],
  },
  stepContent: { flex: 1 },
  stepText: { color: colors.textMuted, fontSize: typography.subtitle },
  stepTextDone: { color: colors.textPrimary, fontWeight: '700' },
  stepActiveHint: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  cancelled: { color: colors.danger, fontSize: typography.subtitle, textAlign: 'center' },
});
