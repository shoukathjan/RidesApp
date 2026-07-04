import { Gender, GENDERS, GenderLabel } from '@useme/shared';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../../api/client';
import { colors, radii, spacing, typography } from '../../theme';
import { Field, PrimaryButton, ScreenHeader } from '../../theme/components';
import { useAuth } from '../../store/AuthContext';
import { useProfile } from '../../store/ProfileContext';

export default function ProfileScreen() {
  const { logout } = useAuth();
  const { refresh } = useProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);

  useEffect(() => {
    api.get('/customer/me').then((r) => {
      setName(r.data.name ?? '');
      setEmail(r.data.email ?? '');
      setGender(r.data.gender ?? null);
    });
  }, []);

  async function save() {
    if (!name.trim()) return Alert.alert('Name required');
    if (!gender) return Alert.alert('Gender required');
    await api.patch('/customer/me', { name: name.trim(), email, gender });
    await refresh();
    Alert.alert('Profile saved');
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Profile" />
      <View style={styles.body}>
        <Field label="Name">
          <TextInput style={styles.input} value={name} onChangeText={setName} />
        </Field>
        <Text style={styles.fieldLabel}>Gender</Text>
        <View style={styles.genderRow}>
          {GENDERS.map((g) => {
            const selected = gender === g;
            return (
              <TouchableOpacity
                key={g}
                style={[styles.genderChip, selected && styles.genderChipActive]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.genderText, selected && styles.genderTextActive]}>
                  {GenderLabel[g]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Field label="Email">
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Field>
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
  fieldLabel: {
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontSize: typography.body,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 8,
    padding: spacing.sm,
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  genderChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
  },
  genderChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderText: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  genderTextActive: {
    color: colors.white,
  },
});
