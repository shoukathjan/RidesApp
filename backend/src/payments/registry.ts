import { razorpayProvider } from './providers/razorpay.provider';
import type { PaymentProvider } from './types';

const providers: Record<string, PaymentProvider> = {
  razorpay: razorpayProvider,
};

export function getPaymentProvider(): PaymentProvider {
  const id = process.env.PAYMENT_PROVIDER ?? 'razorpay';
  const provider = providers[id];
  if (!provider) {
    throw new Error(`Unknown payment provider: ${id}`);
  }
  return provider;
}

export { signCheckoutToken, verifyCheckoutToken } from './types';
