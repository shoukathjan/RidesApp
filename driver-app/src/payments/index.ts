import type { CreateSubscriptionOrderResponse } from '@useme/shared';
import { canUseNativeRazorpay, razorpayNativeGateway } from './gateways/razorpayNative';
import { razorpayWebGateway } from './gateways/razorpayWeb';
import { WebViewPaymentRequired, type PaymentResult } from './types';

export { WebViewPaymentRequired } from './types';
export { canUseNativeRazorpay } from './gateways/razorpayNative';
export {
  parsePaymentDeepLink,
  parseCheckoutCompleteUrl,
  cancelWebCheckout,
  completeWebCheckout,
} from './deepLink';

export async function runPayment(
  order: CreateSubscriptionOrderResponse,
): Promise<PaymentResult> {
  if (canUseNativeRazorpay()) {
    try {
      return await razorpayNativeGateway.startCheckout(order);
    } catch {
      // Dev build without linked native module, or user dismissed — use WebView.
    }
  }
  return razorpayWebGateway.startCheckout(order);
}
