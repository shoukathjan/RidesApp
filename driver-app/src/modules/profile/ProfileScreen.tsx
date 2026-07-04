import { VehicleTypeLabel } from '@useme/shared';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../../api/client';
import { colors, spacing, typography } from '../../theme';
import { Field, PrimaryButton, ScreenHeader } from '../../theme/components';
import { useAuth } from '../../store/AuthContext';

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [name, setName] = useState('');
  const [vehicleType, setVehicleType] = useState<string>('');
  const [validUntil, setValidUntil] = useState<string | null>(null);

  useEffect(() => {
    api.get('/driver/me').then((r) => {
      setName(r.data.name ?? '');
      setVehicleType(r.data.vehicleType ?? '');
      setValidUntil(r.data.subscriptionValidUntil ?? null);
    });
  }, []);

  async function save() {
    await api.patch('/driver/me', { name });
    Alert.alert('Profile saved');
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Profile" />
      <View style={styles.body}>
        <Field label="Name">
          <TextInput style={styles.input} value={name} onChangeText={setName} />
        </Field>
        <Text style={styles.info}>
          Vehicle: {vehicleType ? VehicleTypeLabel[vehicleType as keyof typeof VehicleTypeLabel] : '—'}
        </Text>
        <Text style={styles.info}>
          Subscription until:{' '}
          {validUntil ? new Date(validUntil).toLocaleDateString() : '—'}
        </Text>
        <PrimaryButton title="Save" onPress={save} />
        <View style={{ marginTop: spacing.lg }}>
          <PrimaryButton title="Logout" onPress={logout} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: spacing.lg },
  input: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 8,
    padding: spacing.sm,
  },
  info: { color: colors.textMuted, marginBottom: spacing.sm, fontSize: typography.body },
});
