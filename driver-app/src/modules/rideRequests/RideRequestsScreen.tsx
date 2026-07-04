import { DriverStatus, RideRequestFeedItem, VehicleType, VehicleTypeLabel } from '@useme/shared';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { api } from '../../api/client';
import { ActiveRideCard } from '../../components/ActiveRideCard';
import { useActiveRide } from '../../hooks/useActiveRide';
import { colors, radii, spacing, typography } from '../../theme';
import { PrimaryButton, ScreenHeader } from '../../theme/components';
import { DriverTabParamList, RootStackParamList } from '../../navigation/types';
import { onRequestsRefresh } from '../../realtime/socket';
import { useOnlineStatus } from '../goOnlineOffline/useOnlineStatus';
import { getCurrentCoordinates } from '../../utils/location';

type Props = CompositeScreenProps<
  BottomTabScreenProps<DriverTabParamList, 'RideRequests'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function RideRequestsScreen({ navigation }: Props) {
  const { status, busy, goOnline } = useOnlineStatus();
  const online = status === DriverStatus.ONLINE;
  const { activeRide, refresh: refreshActiveRide } = useActiveRide();

  const [requests, setRequests] = useState<RideRequestFeedItem[]>([]);
  const [radiusKm, setRadiusKm] = useState(10);
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rejected, setRejected] = useState<Set<string>>(new Set());

  useEffect(() => {
    api
      .get<{ vehicleType: VehicleType }>('/driver/me')
      .then((r) => setVehicleType(r.data.vehicleType))
      .catch(() => {});
  }, []);

  const openActiveRide = useCallback(() => {
    if (!activeRide) return;
    navigation.navigate('RideDetail', {
      bookingId: activeRide._id,
      pickup: activeRide.pickup.coordinates,
      destination: activeRide.destination.coordinates,
    });
  }, [activeRide, navigation]);

  const load = useCallback(async (force = false) => {
    const currentActive = await refreshActiveRide();
    if (currentActive) {
      setRequests([]);
      setLoadError(null);
      return;
    }

    if (!force && !online) {
      setRequests([]);
      setLoadError(null);
      return;
    }

    setRefreshing(true);
    setLocationDenied(false);
    setLoadError(null);
    try {
      const coords = await getCurrentCoordinates();
      if (!coords) {
        setLocationDenied(true);
        setRequests([]);
        return;
      }

      const { data } = await api.get<{
        requestRadiusKm: number;
        requests: RideRequestFeedItem[];
      }>('/bookings/requests', {
        params: { lat: coords.lat, lng: coords.lng },
      });
      setRadiusKm(data.requestRadiusKm);
      setRequests(data.requests);
    } catch (err) {
      setRequests([]);
      if (axios.isAxiosError(err)) {
        const msg =
          typeof err.response?.data?.error === 'string'
            ? err.response.data.error
            : err.response?.status === 403
              ? 'Your account cannot receive ride requests yet.'
              : 'Could not load ride requests.';
        setLoadError(msg);
      } else {
        setLoadError('Could not load ride requests.');
      }
    } finally {
      setRefreshing(false);
    }
  }, [online, refreshActiveRide]);

  useEffect(() => {
    load();
    const off = onRequestsRefresh(() => load(true));
    return off;
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load(true);
    }, [load]),
  );

  async function accept(item: RideRequestFeedItem) {
    if (activeRide) {
      Alert.alert(
        'Finish current ride first',
        'Complete your active ride before accepting a new request.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Manage ride', onPress: openActiveRide },
        ],
      );
      return;
    }
    try {
      await api.post(`/bookings/${item._id}/accept`);
      await refreshActiveRide();
      navigation.navigate('RideDetail', {
        bookingId: item._id,
        pickup: item.pickup.coordinates,
        destination: item.destination.coordinates,
      });
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? typeof err.response?.data?.error === 'string'
          ? err.response.data.error
          : 'Could not accept this ride.'
        : 'Could not accept this ride.';
      Alert.alert('Could not accept', msg);
      load(true);
    }
  }

  function reject(id: string) {
    setRejected((prev) => new Set(prev).add(id));
  }

  const visible = requests.filter((r) => !rejected.has(r._id));

  async function handleGoOnline() {
    const ok = await goOnline();
    if (ok) load(true);
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await load(true);
    } finally {
      setRefreshing(false);
    }
  }

  const vehicleLabel = vehicleType ? VehicleTypeLabel[vehicleType] : 'your vehicle';

  if (activeRide) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Current ride" subtitle="You have an active ride in progress" />
        <ScrollView
          contentContainerStyle={styles.activeBody}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <ActiveRideCard ride={activeRide} onManage={openActiveRide} expanded />
        </ScrollView>
      </View>
    );
  }

  if (!online) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Ride Requests" subtitle="Go online to see nearby rides" />
        <View style={styles.offlineBody}>
          <Text style={styles.offlineTitle}>You are offline</Text>
          <Text style={styles.offlineText}>
            Go online with your current location to receive ride requests within{' '}
            {radiusKm} km of you.
          </Text>
          <PrimaryButton title="Go Online" onPress={handleGoOnline} loading={busy} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Ride Requests"
        subtitle={
          vehicleType
            ? `${vehicleLabel} rides within ${radiusKm} km`
            : `Within ${radiusKm} km of your location`
        }
      />
      {loadError ? <Text style={styles.banner}>{loadError}</Text> : null}
      {locationDenied ? (
        <Text style={styles.banner}>
          Location permission is required to find rides near you.
        </Text>
      ) : null}
      <FlatList
        contentContainerStyle={{ padding: spacing.lg }}
        data={visible}
        keyExtractor={(r) => r._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {locationDenied
              ? 'Enable location to see nearby requests.'
              : loadError
                ? 'Fix the issue above, then pull to refresh.'
                : `No ${vehicleLabel} ride requests within ${radiusKm} km right now.\n\nOnly customers who book a ${vehicleLabel} at a nearby pickup will appear here. If you tested with another vehicle type in the customer app, book the same type as your driver profile.`}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>
              {VehicleTypeLabel[item.vehicleType]} · ₹{item.fareEstimate}
            </Text>
            <Text style={styles.highlight}>
              {item.distanceFromDriverKm} km from you · {item.distanceKm} km trip
            </Text>
            <Text style={styles.sub}>
              Pickup at {new Date(item.scheduledAt).toLocaleString()}
            </Text>
            <Text style={styles.sub}>
              {item.pickup.address ?? 'Pickup'} → {item.destination.address ?? 'Destination'}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.btn, styles.accept]}
                onPress={() => accept(item)}
              >
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.reject]}
                onPress={() => reject(item._id)}
              >
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  activeBody: { flexGrow: 1 },
  offlineBody: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.md,
  },
  offlineTitle: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  offlineText: {
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  banner: {
    backgroundColor: colors.surface,
    color: colors.danger,
    padding: spacing.md,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: { fontWeight: '700', fontSize: typography.subtitle, color: colors.textPrimary },
  highlight: { color: colors.primary, fontWeight: '600', marginTop: 4 },
  sub: { color: colors.textMuted, marginTop: 2 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  btn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radii.sm, alignItems: 'center' },
  accept: { backgroundColor: colors.accent },
  acceptText: { color: colors.white, fontWeight: '700' },
  reject: { borderWidth: 1, borderColor: colors.danger },
  rejectText: { color: colors.danger, fontWeight: '700' },
});
