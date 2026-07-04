import { BookingStatus, BookingStatusLabel } from '@useme/shared';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { api } from '../../api/client';
import { colors, spacing, typography } from '../../theme';
import { PrimaryButton, ScreenHeader } from '../../theme/components';
import { RootStackParamList } from '../../navigation/types';
import { openGoogleMaps } from '../../utils/maps';

type Props = NativeStackScreenProps<RootStackParamList, 'RideDetail'>;

export default function RideDetailScreen({ route, navigation }: Props) {
  const { bookingId, pickup, destination } = route.params;
  const [status, setStatus] = useState<BookingStatus>(BookingStatus.DRIVER_ACCEPTED);

  useEffect(() => {
    api.get(`/bookings/${bookingId}`).then((r) => setStatus(r.data.status));
  }, [bookingId]);

  async function act(path: string, next: BookingStatus) {
    try {
      await api.post(`/bookings/${bookingId}/${path}`);
      setStatus(next);
      if (next === BookingStatus.RIDE_COMPLETED) {
        Alert.alert('Ride completed', 'Fare collected. You can accept new requests now.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && typeof err.response?.data?.error === 'string'
          ? err.response.data.error
          : 'Action failed';
      Alert.alert('Action failed', msg);
    }
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Current ride" subtitle={BookingStatusLabel[status]} />
      <View style={styles.body}>
        <PrimaryButton
          title="Navigate to pickup (Google Maps)"
          onPress={() => openGoogleMaps(pickup)}
        />
        <Gap />

        {status === BookingStatus.DRIVER_ACCEPTED && (
          <PrimaryButton
            title="I have arrived"
            onPress={() => act('arrived', BookingStatus.DRIVER_ARRIVED)}
          />
        )}

        {(status === BookingStatus.DRIVER_ARRIVED ||
          status === BookingStatus.DRIVER_ACCEPTED) && (
          <>
            <Gap />
            <PrimaryButton
              title="Start ride"
              onPress={() => act('start', BookingStatus.RIDE_STARTED)}
            />
          </>
        )}

        {status === BookingStatus.RIDE_STARTED && (
          <>
            <Gap />
            <PrimaryButton
              title="Navigate to destination (Google Maps)"
              onPress={() => openGoogleMaps(destination)}
            />
            <Gap />
            <PrimaryButton
              title="Complete ride (collect cash)"
              onPress={() => act('complete', BookingStatus.RIDE_COMPLETED)}
            />
          </>
        )}

        {status === BookingStatus.RIDE_COMPLETED && (
          <Text style={styles.done}>Ride completed. Fare collected in cash.</Text>
        )}

        {(status === BookingStatus.DRIVER_ACCEPTED ||
          status === BookingStatus.DRIVER_ARRIVED) && (
          <>
            <Gap />
            <PrimaryButton
              title="Cancel ride"
              onPress={async () => {
                await api.post(`/bookings/${bookingId}/cancel`);
                navigation.goBack();
              }}
            />
          </>
        )}

        {status === BookingStatus.RIDE_COMPLETED && (
          <>
            <Gap />
            <PrimaryButton title="Back to dashboard" onPress={() => navigation.navigate('Dashboard')} />
          </>
        )}
      </View>
    </View>
  );
}

function Gap() {
  return <View style={{ height: spacing.md }} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: spacing.lg },
  done: {
    marginTop: spacing.lg,
    textAlign: 'center',
    color: colors.accent,
    fontWeight: '700',
    fontSize: typography.subtitle,
  },
});
