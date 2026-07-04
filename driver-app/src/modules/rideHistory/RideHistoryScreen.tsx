import { BookingStatusLabel, VehicleTypeLabel } from '@useme/shared';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api } from '../../api/client';
import { colors, spacing, typography } from '../../theme';
import { ScreenHeader } from '../../theme/components';

interface Ride {
  _id: string;
  vehicleType: keyof typeof VehicleTypeLabel;
  status: keyof typeof BookingStatusLabel;
  fareEstimate: number;
  scheduledAt: string;
  pickup?: { address?: string };
  destination?: { address?: string };
}

export default function RideHistoryScreen() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.get<Ride[]>('/driver/me/rides');
      setRides(data);
    } catch {
      setRides([]);
      setError('Could not load ride history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function handleRefresh() {
    setRefreshing(true);
    load();
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Ride history" subtitle="Rides you have completed or handled" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
        data={rides}
        keyExtractor={(r) => r._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading ? 'Loading…' : error ? 'Pull to try again.' : 'No rides yet.'}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>
              {VehicleTypeLabel[item.vehicleType]} · ₹{item.fareEstimate}
            </Text>
            <Text style={styles.sub}>{BookingStatusLabel[item.status]}</Text>
            <Text style={styles.sub}>
              {new Date(item.scheduledAt).toLocaleString()}
            </Text>
            {item.pickup?.address || item.destination?.address ? (
              <Text style={styles.route} numberOfLines={2}>
                {item.pickup?.address ?? 'Pickup'} →{' '}
                {item.destination?.address ?? 'Destination'}
              </Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  error: {
    color: colors.danger,
    textAlign: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: { fontWeight: '700', color: colors.textPrimary, fontSize: typography.subtitle },
  sub: { color: colors.textMuted, marginTop: 2 },
  route: { color: colors.textMuted, marginTop: spacing.sm, lineHeight: 20 },
});
