import type { CreateSubscriptionOrderResponse } from '@useme/shared';
import { fixCheckoutUrl } from '../checkoutUrl';
import { WebViewPaymentRequired } from '../types';
import type { PaymentGateway } from '../types';

export const razorpayWebGateway: PaymentGateway = {
  async startCheckout(order: CreateSubscriptionOrderResponse) {
    throw new WebViewPaymentRequired(fixCheckoutUrl(order.checkoutUrl), order);
  },
};
