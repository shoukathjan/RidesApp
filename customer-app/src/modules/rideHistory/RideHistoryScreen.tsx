import { BookingStatusLabel, VehicleTypeLabel } from '@useme/shared';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { api } from '../../api/client';
import { colors, spacing, typography } from '../../theme';
import { ScreenHeader } from '../../theme/components';

interface Ride {
  _id: string;
  vehicleType: keyof typeof VehicleTypeLabel;
  status: keyof typeof BookingStatusLabel;
  fareEstimate: number;
  scheduledAt: string;
}

export default function RideHistoryScreen() {
  const [rides, setRides] = useState<Ride[]>([]);

  useEffect(() => {
    api.get<Ride[]>('/bookings/history').then((r) => setRides(r.data));
  }, []);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Ride history" />
      <FlatList
        contentContainerStyle={{ padding: spacing.lg }}
        data={rides}
        keyExtractor={(r) => r._id}
        ListEmptyComponent={<Text style={styles.empty}>No rides yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>
              {VehicleTypeLabel[item.vehicleType]} · ₹{item.fareEstimate}
            </Text>
            <Text style={styles.sub}>{BookingStatusLabel[item.status]}</Text>
            <Text style={styles.sub}>
              {new Date(item.scheduledAt).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: { fontWeight: '700', color: colors.textPrimary, fontSize: typography.subtitle },
  sub: { color: colors.textMuted, marginTop: 2 },
});
