import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { ScreenHeader } from '../../theme/components';
import { colors, spacing, typography } from '../../theme';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SubscriptionCheckout'>;

type WebPaymentMessage =
  | {
      type: 'subscription_verified';
      subscriptionValidUntil: string;
      durationDays?: number;
    }
  | { type: 'subscription_verify_failed'; error?: string }
  | { type: 'payment_cancel' };

export default function SubscriptionCheckoutScreen({ navigation, route }: Props) {
  const done = useRef(false);
  const [verifying, setVerifying] = useState(false);
  const { checkoutUrl, planName, durationDays } = route.params;

  function goSuccess(subscriptionValidUntil: string, durationDays?: number) {
    if (done.current) return;
    done.current = true;
    setVerifying(false);
    navigation.replace('SubscriptionSuccess', {
      subscriptionValidUntil,
      planName,
      durationDays: durationDays ?? route.params.durationDays,
    });
  }

  function handleCancel() {
    if (done.current || verifying) return;
    navigation.goBack();
  }

  function onWebMessage(event: WebViewMessageEvent) {
    try {
      const msg = JSON.parse(event.nativeEvent.data) as WebPaymentMessage;
      if (msg.type === 'payment_cancel') {
        handleCancel();
        return;
      }
      if (msg.type === 'subscription_verified' && msg.subscriptionValidUntil) {
        goSuccess(msg.subscriptionValidUntil, msg.durationDays ?? undefined);
        return;
      }
      if (msg.type === 'subscription_verify_failed') {
        if (done.current) return;
        setVerifying(false);
        Alert.alert('Payment', msg.error ?? 'Verification failed. Please try again.');
        navigation.goBack();
      }
    } catch {
      // ignore non-JSON messages
    }
  }

  function onNavChange(nav: WebViewNavigation) {
    if (nav.url.includes('/subscriptions/checkout/complete/') && !done.current) {
      setVerifying(true);
    }
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Payment" subtitle={planName} />
      <View style={styles.webWrap}>
        <WebView
          source={{ uri: checkoutUrl }}
          originWhitelist={['http://*', 'https://*']}
          onMessage={onWebMessage}
          onNavigationStateChange={onNavChange}
          onError={() => {
            if (done.current || verifying) return;
            Alert.alert(
              'Payment',
              'Could not load checkout. Check Wi‑Fi and that backend is running.',
            );
            navigation.goBack();
          }}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        />
        {verifying ? (
          <View style={styles.verifyingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.verifyingText}>Verifying payment…</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  webWrap: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  verifyingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: spacing.lg,
  },
  verifyingText: {
    marginTop: spacing.md,
    color: colors.textMuted,
    fontSize: typography.body,
  },
});
