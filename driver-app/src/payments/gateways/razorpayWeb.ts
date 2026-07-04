import type { CreateSubscriptionOrderResponse } from '@useme/shared';
import { WebViewPaymentRequired } from '../types';
import type { PaymentGateway } from '../types';

export const razorpayWebGateway: PaymentGateway = {
  async startCheckout(order: CreateSubscriptionOrderResponse) {
    throw new WebViewPaymentRequired(order.checkoutUrl, order);
  },
};
