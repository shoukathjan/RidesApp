import { VehicleType, VehicleTypeLabel } from '@useme/shared';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AddressSearchInput from '../../components/AddressSearchInput';
import { api } from '../../api/client';
import { useHideTabBar } from '../../hooks/useHideTabBar';
import { colors, radii, spacing, typography } from '../../theme';
import { PrimaryButton, ScreenHeader } from '../../theme/components';
import { shadowSm } from '../../theme/shadows';
import { HomeStackParamList } from '../../navigation/types';
import { useBooking } from '../../store/BookingContext';
import { getCurrentCoordinates } from '../../utils/location';
import { reverseGeocodePlace, SelectedPlace } from '../../utils/places';
import BookingStepper, { StepDef } from './components/BookingStepper';
import StepFooter from './components/StepFooter';
import TimeSelector from './components/TimeSelector';
import VehicleSelector from './components/VehicleSelector';

type Props = NativeStackScreenProps<HomeStackParamList, 'BookRideFlow'>;

const STEPS: StepDef[] = [
  { key: 'pickup', label: 'Pickup', icon: 'location' },
  { key: 'destination', label: 'Drop', icon: 'navigate' },
  { key: 'vehicle', label: 'Vehicle', icon: 'car' },
  { key: 'schedule', label: 'Time', icon: 'time' },
  { key: 'confirm', label: 'Confirm', icon: 'checkmark-circle' },
];

const STEP_META: Record<number, { title: string; hint: string; icon: keyof typeof Ionicons.glyphMap }> = {
  0: {
    title: 'Where should we pick you up?',
    hint: 'Use GPS or search by village, area, or landmark',
    icon: 'location',
  },
  1: {
    title: 'Where are you going?',
    hint: 'Search by village, city, landmark, or full address',
    icon: 'navigate',
  },
  2: {
    title: 'Choose your ride',
    hint: 'Select the vehicle type you need',
    icon: 'car-sport',
  },
  3: {
    title: 'When do you need the ride?',
    hint: 'Drivers will see this scheduled pickup time',
    icon: 'time',
  },
  4: {
    title: 'Review your booking',
    hint: 'Confirm details before requesting a driver',
    icon: 'checkmark-circle',
  },
};

function defaultScheduleTime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 30);
  d.setSeconds(0, 0);
  const remainder = d.getMinutes() % 30;
  if (remainder !== 0) {
    d.setMinutes(d.getMinutes() + (30 - remainder));
  }
  return d;
}

export default function BookRideFlowScreen({ navigation, route }: Props) {
  useHideTabBar();

  const { setDraft, setActiveBookingId } = useBooking();
  const [step, setStep] = useState(route.params?.initialStep ?? 0);

  const [pickup, setPickup] = useState<SelectedPlace | null>(null);
  const [destination, setDestination] = useState<SelectedPlace | null>(null);
  const [locationBias, setLocationBias] = useState<SelectedPlace['coordinates'] | null>(null);
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.AUTO);
  const [scheduledAt, setScheduledAt] = useState(defaultScheduleTime);
  const [fare, setFare] = useState<number | null>(null);
  const [fareError, setFareError] = useState<string | null>(null);

  const [locating, setLocating] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [booking, setBooking] = useState(false);
  const didAutoPickup = useRef(false);
  const estimateSeq = useRef(0);

  const pickupCoords = pickup?.coordinates ?? null;
  const destCoords = destination?.coordinates ?? null;

  const resetKey = route.params?.resetKey;
  const initialStep = route.params?.initialStep ?? 0;

  function resetBookingForm(nextStep = initialStep) {
    setStep(nextStep);
    setPickup(null);
    setDestination(null);
    setVehicleType(VehicleType.AUTO);
    setScheduledAt(defaultScheduleTime());
    setFare(null);
    setFareError(null);
    didAutoPickup.current = false;
  }

  useEffect(() => {
    resetBookingForm(initialStep);
    getCurrentCoordinates().then((coords) => {
      if (coords) setLocationBias(coords);
    });
    if (initialStep === 1) {
      didAutoPickup.current = true;
      void fillPickupFromCurrentLocation();
    }
  }, [resetKey, initialStep]);

  useEffect(() => {
    if (step !== 4) estimateSeq.current += 1;
  }, [step]);

  const loadFareEstimate = useCallback(
    async (showAlert: boolean) => {
      if (!pickupCoords || !destCoords) return;
      const seq = ++estimateSeq.current;
      setEstimating(true);
      setFareError(null);
      setFare(null);

      async function attempt(allowRetry: boolean): Promise<void> {
        try {
          const { data } = await api.post<{ total?: number }>('/bookings/estimate', {
            vehicleType,
            pickup: pickupCoords,
            destination: destCoords,
          });
          if (seq !== estimateSeq.current) return;
          const total = data?.total;
          if (total == null || !Number.isFinite(total)) {
            throw new Error('Invalid fare response');
          }
          setFare(total);
          setFareError(null);
        } catch (err) {
          if (seq !== estimateSeq.current) return;
          if (allowRetry) {
            await new Promise((r) => setTimeout(r, 800));
            return attempt(false);
          }
          const msg = fareEstimateErrorMessage(err);
          setFareError(msg);
          if (showAlert) Alert.alert('Fare estimate', msg);
        } finally {
          if (seq === estimateSeq.current) setEstimating(false);
        }
      }

      await attempt(true);
    },
    [pickupCoords, destCoords, vehicleType],
  );

  useEffect(() => {
    if (step === 4 && pickupCoords && destCoords) {
      void loadFareEstimate(false);
    }
  }, [step, pickupCoords, destCoords, vehicleType, loadFareEstimate]);

  async function fillPickupFromCurrentLocation() {
    setLocating(true);
    const coords = await getCurrentCoordinates();
    if (!coords) {
      setLocating(false);
      return Alert.alert('Location permission denied');
    }
    setLocationBias(coords);
    try {
      const place = await reverseGeocodePlace(coords);
      setPickup(place);
    } catch {
      setPickup({
        label: 'Current location',
        address: 'Current location',
        coordinates: coords,
      });
    } finally {
      setLocating(false);
    }
  }

  function validateStep(): boolean {
    switch (step) {
      case 0:
        if (!pickup) {
          Alert.alert('Pickup required', 'Use current location or search for your pickup point.');
          return false;
        }
        return true;
      case 1:
        if (!destination) {
          Alert.alert('Destination required', 'Search and select where you are going.');
          return false;
        }
        return true;
      case 2:
        return true;
      case 3:
        if (scheduledAt.getTime() <= Date.now()) {
          Alert.alert('Invalid time', 'Pick a future pickup time.');
          return false;
        }
        return true;
      case 4:
        if (fare == null) {
          Alert.alert(
            'Fare unavailable',
            fareError ?? 'Could not load fare estimate. Tap Retry on the review screen.',
          );
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  function goNext() {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    confirmBooking();
  }

  function goBack() {
    if (step > 0) setStep((s) => s - 1);
    else navigation.goBack();
  }

  async function confirmBooking() {
    if (!pickup || !destination || fare == null) return;
    setBooking(true);
    try {
      const pickupPayload = {
        address: pickup.address ?? pickup.label,
        coordinates: pickup.coordinates,
        locality: pickup.locality,
        city: pickup.city,
        state: pickup.state,
      };
      const destPayload = {
        address: destination.address ?? destination.label,
        coordinates: destination.coordinates,
        locality: destination.locality,
        city: destination.city,
        state: destination.state,
      };
      const scheduledIso = scheduledAt.toISOString();

      setDraft({
        pickup: pickupPayload,
        destination: destPayload,
        vehicleType,
        scheduledAt: scheduledIso,
        fareEstimate: fare,
      });

      const { data } = await api.post('/bookings', {
        pickup: pickupPayload,
        destination: destPayload,
        vehicleType,
        scheduledAt: scheduledIso,
      });
      setActiveBookingId(data._id);
      navigation.replace('BookingStatus', { bookingId: data._id });
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? typeof err.response?.data?.error === 'string'
          ? err.response.data.error
          : 'Could not create booking'
        : 'Could not create booking';
      Alert.alert('Booking failed', msg);
    } finally {
      setBooking(false);
    }
  }

  const stepTitle = STEPS[step]?.label ?? 'Book';
  const stepMeta = STEP_META[step];
  const nextLabel =
    step === STEPS.length - 1 ? 'Book ride' : step === 3 ? 'Review & book' : 'Continue';
  const destAutoFocus = step === 1;

  return (
    <View style={styles.container}>
      <ScreenHeader
        compact
        title="Book a ride"
        subtitle={`Step ${step + 1} of ${STEPS.length} · ${stepTitle}`}
      />
      <BookingStepper steps={STEPS} currentIndex={step} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.content}>
          <View style={styles.stepCard}>
            <Text style={styles.stepHeading}>{stepMeta.title}</Text>
            <Text style={styles.stepHint}>{stepMeta.hint}</Text>

            <ScrollView
              style={styles.stepBody}
              contentContainerStyle={styles.stepBodyContent}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
            {step === 0 && (
              <View>
                <Pressable
                  style={[styles.gpsCard, shadowSm]}
                  onPress={() => fillPickupFromCurrentLocation()}
                  disabled={locating}
                >
                  <View style={styles.gpsIcon}>
                    <Ionicons name="navigate" size={22} color={colors.white} />
                  </View>
                  <View style={styles.gpsText}>
                    <Text style={styles.gpsTitle}>
                      {locating ? 'Locating…' : 'Use current location'}
                    </Text>
                    <Text style={styles.gpsSub}>Fast GPS pickup at your position</Text>
                  </View>
                  {locating ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  )}
                </Pressable>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or search</Text>
                  <View style={styles.dividerLine} />
                </View>
                <AddressSearchInput
                  placeholder="Search pickup location"
                  value={pickup}
                  onChange={setPickup}
                  bias={locationBias}
                />
              </View>
            )}

            {step === 1 && (
              <AddressSearchInput
                key={`destination-${resetKey ?? 'default'}`}
                placeholder="Search destination"
                value={destination}
                onChange={setDestination}
                bias={pickup?.coordinates ?? locationBias}
                autoFocus={destAutoFocus}
                showRecents={false}
              />
            )}

            {step === 2 && (
              <VehicleSelector
                value={vehicleType}
                onChange={(v) => {
                  setVehicleType(v);
                  setFare(null);
                  setFareError(null);
                }}
              />
            )}

            {step === 3 && (
              <TimeSelector value={scheduledAt} onChange={setScheduledAt} />
            )}

            {step === 4 && (
              <View>
                <RoutePreview pickup={pickup} destination={destination} />
                <View style={styles.summaryGrid}>
                  <SummaryChip label="Vehicle" value={VehicleTypeLabel[vehicleType]} />
                  <SummaryChip
                    label="Scheduled"
                    value={scheduledAt.toLocaleString(undefined, {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  />
                </View>
                <View style={styles.fareBox}>
                  {estimating ? (
                    <Text style={styles.fareLoading}>Calculating fare…</Text>
                  ) : fare != null ? (
                    <>
                      <Text style={styles.fareLabel}>Estimated fare</Text>
                      <Text style={styles.fareValue}>₹{fare}</Text>
                      <Text style={styles.fareNote}>Final fare may vary slightly by route</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.fareLoading}>{fareError ?? 'Fare unavailable'}</Text>
                      <PrimaryButton
                        title="Retry fare calculation"
                        onPress={() => loadFareEstimate(true)}
                        compact
                      />
                    </>
                  )}
                </View>
              </View>
            )}
            </ScrollView>
          </View>
        </View>

        <StepFooter
          onBack={goBack}
          onNext={goNext}
          nextLabel={nextLabel}
          loading={booking || (step === 4 && estimating)}
          nextDisabled={step === 4 && fare == null && !estimating}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

function RoutePreview({
  pickup,
  destination,
}: {
  pickup: SelectedPlace | null;
  destination: SelectedPlace | null;
}) {
  return (
    <View style={styles.routeCard}>
      <View style={styles.routeRow}>
        <View style={styles.routeMarkerCol}>
          <View style={[styles.routeDot, styles.routeDotPickup]} />
          <View style={styles.routeLine} />
          <View style={[styles.routeDot, styles.routeDotDrop]} />
        </View>
        <View style={styles.routeTextCol}>
          <View style={styles.routeStop}>
            <Text style={styles.routeLabel}>Pickup</Text>
            <Text style={styles.routeValue}>{pickup?.label ?? '—'}</Text>
            {pickup?.address && pickup.address !== pickup.label ? (
              <Text style={styles.routeSub} numberOfLines={2}>
                {pickup.address}
              </Text>
            ) : null}
          </View>
          <View style={styles.routeStop}>
            <Text style={styles.routeLabel}>Drop</Text>
            <Text style={styles.routeValue}>{destination?.label ?? '—'}</Text>
            {destination?.address && destination.address !== destination.label ? (
              <Text style={styles.routeSub} numberOfLines={2}>
                {destination.address}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryChip}>
      <Text style={styles.summaryChipLabel}>{label}</Text>
      <Text style={styles.summaryChipValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  stepCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing.md,
  },
  stepBody: {
    flex: 1,
  },
  stepBodyContent: {
    flexGrow: 1,
    paddingBottom: spacing.xs,
  },
  stepHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  stepHint: {
    fontSize: typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    marginBottom: spacing.md,
  },
  gpsIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsText: { flex: 1 },
  gpsTitle: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  gpsSub: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderDefault,
  },
  dividerText: {
    fontSize: typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  routeCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  routeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  routeMarkerCol: {
    alignItems: 'center',
    paddingTop: 4,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeDotPickup: {
    backgroundColor: colors.accent,
  },
  routeDotDrop: {
    backgroundColor: colors.primary,
  },
  routeLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: colors.borderDefault,
    marginVertical: 4,
  },
  routeTextCol: {
    flex: 1,
    gap: spacing.lg,
  },
  routeStop: {},
  routeLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  routeValue: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  routeSub: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryChip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  summaryChipLabel: {
    fontSize: typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryChipValue: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  fareBox: {
    padding: spacing.lg,
    backgroundColor: `${colors.accent}10`,
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${colors.accent}40`,
  },
  fareLabel: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginBottom: 4,
    fontWeight: '600',
  },
  fareValue: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.accent,
  },
  fareNote: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  fareLoading: {
    color: colors.textMuted,
    fontSize: typography.subtitle,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});

function fareEstimateErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const serverMsg = err.response?.data?.error;
    if (typeof serverMsg === 'string') return serverMsg;
    if (err.message.includes('Network Error')) {
      return 'Could not reach server. Check Wi‑Fi and that the backend is running.';
    }
    if (err.response?.status === 404) {
      return 'Fare is not configured for this vehicle type. Try another vehicle.';
    }
  }
  return 'Fare calculation failed. Tap Retry.';
}
