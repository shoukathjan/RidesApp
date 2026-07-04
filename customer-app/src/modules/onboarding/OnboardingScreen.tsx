import { Gender, GENDERS, GenderLabel } from '@useme/shared';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../api/client';
import { useBranding } from '../../config/AppConfigContext';
import { colors, radii, spacing, typography } from '../../theme';
import { Field, PrimaryButton, ScreenHeader } from '../../theme/components';
import { useProfile } from '../../store/ProfileContext';

export default function OnboardingScreen() {
  const branding = useBranding();
  const { refresh } = useProfile();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      return Alert.alert('Name required', 'Please enter your name.');
    }
    if (!gender) {
      return Alert.alert('Gender required', 'Please select your gender.');
    }

    setLoading(true);
    try {
      await api.patch('/customer/me', { name: trimmed, gender });
      await refresh();
    } catch {
      Alert.alert('Could not save', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader
        title={`Welcome to ${branding.appName}`}
        subtitle="Tell us a bit about you"
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.intro}>
            We use this to personalize your rides and keep your account secure.
          </Text>

          <Field label="Your name">
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
            />
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
                  activeOpacity={0.85}
                >
                  <Text style={[styles.genderText, selected && styles.genderTextActive]}>
                    {GenderLabel[g]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton title="Continue" onPress={submit} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  body: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  intro: {
    fontSize: typography.body,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontSize: typography.body,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: typography.subtitle,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  genderChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.white,
  },
  genderChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  genderTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderDefault,
    backgroundColor: colors.white,
  },
});
