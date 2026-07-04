import { DriverStatus } from '@useme/shared';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActiveRideCard } from '../../components/ActiveRideCard';
import { useActiveRide } from '../../hooks/useActiveRide';
import { colors, spacing, typography } from '../../theme';
import { PrimaryButton, ScreenHeader } from '../../theme/components';
import { DriverTabParamList, RootStackParamList } from '../../navigation/types';
import { useOnlineStatus } from '../goOnlineOffline/useOnlineStatus';

type Props = CompositeScreenProps<
  BottomTabScreenProps<DriverTabParamList, 'Dashboard'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function DashboardScreen({ navigation }: Props) {
  const { status, busy, goOnline, goOffline } = useOnlineStatus();
  const online = status === DriverStatus.ONLINE;
  const { activeRide, refresh } = useActiveRide();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  function openActiveRide() {
    if (!activeRide) return;
    navigation.navigate('RideDetail', {
      bookingId: activeRide._id,
      pickup: activeRide.pickup.coordinates,
      destination: activeRide.destination.coordinates,
    });
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Home" subtitle={online ? 'You are ONLINE' : 'You are OFFLINE'} />
      <ScrollView contentContainerStyle={styles.body}>
        {activeRide ? (
          <ActiveRideCard ride={activeRide} onManage={openActiveRide} />
        ) : null}

        <View style={[styles.statusPill, online ? styles.online : styles.offline]}>
          <Text style={styles.statusText}>{online ? 'ONLINE' : 'OFFLINE'}</Text>
        </View>

        <PrimaryButton
          title={online ? 'Go Offline' : 'Go Online'}
          onPress={online ? goOffline : goOnline}
          loading={busy}
        />

        {online && !activeRide ? (
          <Text style={styles.hint}>
            Only ride requests matching your registered vehicle type appear on the Requests tab.
            Stay within about 10 km of the pickup and pull to refresh if a new booking was just
            created.
          </Text>
        ) : null}

        {activeRide ? (
          <Text style={styles.hint}>
            You have an active ride. Finish it from the Requests tab or tap Resume ride above.
          </Text>
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton title="View Earnings" onPress={() => navigation.navigate('Earnings')} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.lg, gap: spacing.lg },
  statusPill: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
  },
  online: { backgroundColor: colors.accent },
  offline: { backgroundColor: colors.borderDefault },
  statusText: { color: colors.white, fontWeight: '700', fontSize: typography.subtitle },
  hint: {
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: { marginTop: spacing.sm },
});
