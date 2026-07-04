import { StyleSheet, Text, View } from 'react-native';
import { useBranding } from '../../config/AppConfigContext';
import { colors, spacing, typography } from '../../theme';
import { PrimaryButton, ScreenHeader } from '../../theme/components';
import { useAccess } from '../../gating/AccessContext';
import { useAuth } from '../../store/AuthContext';

export default function PendingApprovalScreen() {
  const branding = useBranding();
  const { refresh } = useAccess();
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Pending approval" />
      <View style={styles.body}>
        <Text style={styles.emoji}>⏳</Text>
        <Text style={styles.title}>Please wait for approval</Text>
        <Text style={styles.text}>
          Your registration has been submitted and is under review by the {branding.appName}{' '}
          team. You'll be able to go online once an admin approves your account.
        </Text>
        <PrimaryButton title="Check again" onPress={refresh} />
        <View style={{ marginTop: spacing.md }}>
          <PrimaryButton title="Logout" onPress={logout} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: spacing.md },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  text: {
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
});
