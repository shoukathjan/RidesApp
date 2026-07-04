import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { api } from '../../api/client';
import { colors, radii, spacing, typography } from '../../theme';
import { PrimaryButton, ScreenHeader } from '../../theme/components';
import { runPayment, WebViewPaymentRequired } from '../../payments';
import { fixCheckoutUrl } from '../../payments/checkoutUrl';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SubscriptionPayment'>;

export default function SubscriptionPaymentScreen({ navigation, route }: Props) {
  const { planId, planName, amount, durationDays } = route.params;
  const [busy, setBusy] = useState(false);

  async function pay() {
    setBusy(true);
    try {
      const { data: order } = await api.post('/subscriptions/order', { planId });
      try {
        const payment = await runPayment(order);
        const { data } = await api.post('/subscriptions/verify', payment);
        navigation.replace('SubscriptionSuccess', {
          subscriptionValidUntil: data.subscriptionValidUntil,
          planName,
          durationDays: data.durationDays ?? durationDays,
        });
      } catch (err) {
        if (err instanceof WebViewPaymentRequired) {
          navigation.replace('SubscriptionCheckout', {
            checkoutUrl: fixCheckoutUrl(err.checkoutUrl),
            subscriptionId: order.subscriptionId,
            planName,
            durationDays,
          });
          return;
        }
        throw err;
      }
    } catch (err) {
      let msg = 'Payment cancelled or failed';
      if (axios.isAxiosError(err)) {
        const serverMsg = err.response?.data?.error;
        if (typeof serverMsg === 'string') msg = serverMsg;
        else if (err.message.includes('Network Error')) {
          msg = 'Cannot reach server. Check Wi‑Fi and that backend is running.';
        }
      } else if (err instanceof Error && err.message.includes('Razorpay keys')) {
        msg = 'Payment is not configured on the server. Add Razorpay test keys.';
      } else if (err instanceof Error && err.message !== 'WEBVIEW_REQUIRED') {
        msg = err.message;
      }
      Alert.alert('Payment', msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Confirm subscription" subtitle={planName} />
      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="card-account-details-outline" size={56} color={colors.primary} />
        </View>
        <Text style={styles.planName}>{planName}</Text>
        <Text style={styles.duration}>Valid for {durationDays} days</Text>

        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Amount to pay</Text>
          <Text style={styles.amount}>₹{amount}</Text>
        </View>

        <Text style={styles.hint}>
          You will be taken to a secure Razorpay payment screen to complete your subscription.
        </Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton
          title={busy ? 'Processing…' : `Pay ₹${amount}`}
          onPress={pay}
          loading={busy}
          compact
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { marginBottom: spacing.md },
  planName: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  duration: { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  amountBox: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.lg,
  },
  amountLabel: { color: colors.textMuted, fontSize: typography.body },
  amount: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  hint: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: typography.caption,
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
});
