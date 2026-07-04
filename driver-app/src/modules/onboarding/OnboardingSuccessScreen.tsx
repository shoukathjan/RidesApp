import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBranding } from '../../config/AppConfigContext';
import { colors, spacing, typography } from '../../theme';
import { PrimaryButton, ScreenHeader } from '../../theme/components';
import { useOnboardingWelcome } from '../../gating/useOnboardingWelcome';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingSuccess'>;

export default function OnboardingSuccessScreen({ navigation }: Props) {
  const branding = useBranding();
  const { markSeen } = useOnboardingWelcome();

  async function continueToPlans() {
    await markSeen();
    navigation.replace('Subscription');
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={`Welcome to ${branding.driverAppName}`} subtitle="You're approved!" />
      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={72} color={colors.accent} />
        </View>
        <Text style={styles.title}>Congratulations!</Text>
        <Text style={styles.text}>
          You have successfully onboarded with {branding.appName}. Take a subscription plan for
          your vehicle type to start receiving ride requests near you.
        </Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton title="Choose subscription plan" onPress={continueToPlans} compact />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: spacing.lg, justifyContent: 'center', alignItems: 'center' },
  iconWrap: { marginBottom: spacing.lg },
  title: {
    fontSize: typography.title,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  text: {
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: typography.body,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
});
