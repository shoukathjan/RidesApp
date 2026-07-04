import type { PaymentResult } from './types';

function queryParams(url: string): Record<string, string> {
  const q = url.split('?')[1];
  if (!q) return {};
  const out: Record<string, string> = {};
  for (const part of q.split('&')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq);
    const value = part.slice(eq + 1);
    if (key && value) out[decodeURIComponent(key)] = decodeURIComponent(value);
  }
  return out;
}

/** HTTP redirect after Razorpay success (reliable in WebView). */
export function parseCheckoutCompleteUrl(
  url: string,
): Pick<PaymentResult, 'paymentId' | 'signature'> | null {
  if (!url.includes('/subscriptions/checkout/complete/')) return null;
  const { paymentId, signature } = queryParams(url);
  if (paymentId && signature) return { paymentId, signature };
  return null;
}

export function parsePaymentDeepLink(url: string): PaymentResult | 'cancel' | null {
  if (!url.startsWith('usemedriver://payment/')) return null;
  if (url.includes('payment/cancel')) return 'cancel';
  const { subscriptionId, paymentId, signature } = queryParams(url);
  if (subscriptionId && paymentId && signature) {
    return { subscriptionId, paymentId, signature };
  }
  return null;
}

export function cancelWebCheckout(_message = 'Payment cancelled') {
  // no-op; kept for checkout screen error paths
}

export function completeWebCheckout(_result: PaymentResult) {
  // no-op; checkout screen verifies directly
}
