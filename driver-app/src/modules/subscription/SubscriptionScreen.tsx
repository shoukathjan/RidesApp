import { VehicleType, VehicleTypeLabel } from '@useme/shared';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { api } from '../../api/client';
import { colors, radii, spacing, typography } from '../../theme';
import { PrimaryButton, ScreenHeader } from '../../theme/components';
import { useAuth } from '../../store/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

interface Plan {
  _id: string;
  name: string;
  amount: number;
  durationDays: number;
  vehicleType: VehicleType;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Subscription'>;

export default function SubscriptionScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data: profile } = await api.get<{ vehicleType: VehicleType }>('/driver/me');
        setVehicleType(profile.vehicleType);
        const { data } = await api.get<Plan[]>('/subscriptions/plans', {
          params: { vehicleType: profile.vehicleType },
        });
        setPlans(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function subscribe(plan: Plan) {
    navigation.navigate('SubscriptionPayment', {
      planId: plan._id,
      planName: plan.name,
      amount: plan.amount,
      durationDays: plan.durationDays,
    });
  }

  const vehicleLabel = vehicleType ? VehicleTypeLabel[vehicleType] : 'your vehicle';

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Subscription"
        subtitle={`Plans for ${vehicleLabel} drivers only`}
      />
      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <FlatList
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
          data={plans}
          keyExtractor={(p) => p._id}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No subscription plans for {vehicleLabel} yet. Contact admin.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.vehicle}>{VehicleTypeLabel[item.vehicleType]}</Text>
              <Text style={styles.amount}>₹{item.amount}</Text>
              <Text style={styles.duration}>Valid for {item.durationDays} days</Text>
              <View style={{ marginTop: spacing.md }}>
                <PrimaryButton title="Subscribe" onPress={() => subscribe(item)} compact />
              </View>
            </View>
          )}
          ListFooterComponent={
            <View style={{ marginTop: spacing.lg }}>
              <PrimaryButton title="Logout" onPress={logout} compact />
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
  card: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  name: { fontWeight: '700', fontSize: typography.subtitle, color: colors.textPrimary },
  vehicle: { color: colors.primary, fontWeight: '600', marginTop: 2, fontSize: typography.caption },
  amount: { fontSize: typography.title, color: colors.accent, fontWeight: '700', marginTop: 4 },
  duration: { color: colors.textMuted, marginTop: 4 },
});
