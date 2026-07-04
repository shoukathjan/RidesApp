import { VehicleType, VEHICLE_TYPES, VehicleTypeLabel } from '@useme/shared';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../api/client';
import { colors, radii, spacing } from '../../theme';
import { Field, PrimaryButton, ScreenHeader } from '../../theme/components';
import { RootStackParamList } from '../../navigation/types';
import { uploadDocument } from './uploadDocument';

type Props = NativeStackScreenProps<RootStackParamList, 'Registration'>;

export default function RegistrationScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.AUTO);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [licenseUrl, setLicenseUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pickLicense() {
    // Placeholder: in a full build use expo-image-picker, then uploadDocument().
    const url = await uploadDocument('license');
    if (url) setLicenseUrl(url);
  }

  async function submit() {
    if (phone.length < 10) return Alert.alert('Enter a valid number');
    setLoading(true);
    try {
      await api.post('/driver/register', {
        phone: `+91${phone}`,
        name,
        vehicleType,
        vehicleDetails: { registrationNumber },
        documents: { licenseUrl: licenseUrl ?? undefined },
      });
      Alert.alert(
        'Registered',
        'Your registration is pending admin approval. Please log in.',
        [{ text: 'OK', onPress: () => navigation.replace('Login') }],
      );
    } catch (e) {
      Alert.alert('Registration failed', 'This number may already be registered.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Driver Registration" />
      <ScrollView contentContainerStyle={styles.body}>
        <Field label="Mobile number">
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
          />
        </Field>
        <Field label="Name">
          <TextInput style={styles.input} value={name} onChangeText={setName} />
        </Field>

        <Text style={styles.label}>Vehicle type</Text>
        <View style={styles.row}>
          {VEHICLE_TYPES.map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.chip, vehicleType === v && styles.chipActive]}
              onPress={() => setVehicleType(v)}
            >
              <Text style={vehicleType === v ? styles.chipTextActive : styles.chipText}>
                {VehicleTypeLabel[v]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field label="Vehicle registration number">
          <TextInput
            style={styles.input}
            value={registrationNumber}
            onChangeText={setRegistrationNumber}
            autoCapitalize="characters"
          />
        </Field>

        <TouchableOpacity style={styles.upload} onPress={pickLicense}>
          <Text style={{ color: colors.primary }}>
            {licenseUrl ? 'License uploaded ✓' : 'Upload driving license'}
          </Text>
        </TouchableOpacity>

        <View style={{ marginTop: spacing.lg }}>
          <PrimaryButton title="Submit registration" onPress={submit} loading={loading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.lg },
  input: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 8,
    padding: spacing.sm,
  },
  label: { color: colors.textMuted, marginBottom: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textPrimary },
  chipTextActive: { color: colors.white, fontWeight: '700' },
  upload: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
  },
});
