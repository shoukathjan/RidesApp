import type { CreateSubscriptionOrderResponse } from '@useme/shared';

export interface PaymentResult {
  subscriptionId: string;
  paymentId: string;
  signature: string;
}

export interface PaymentGateway {
  startCheckout(order: CreateSubscriptionOrderResponse): Promise<PaymentResult>;
}

export class WebViewPaymentRequired extends Error {
  checkoutUrl: string;
  order: CreateSubscriptionOrderResponse;

  constructor(checkoutUrl: string, order: CreateSubscriptionOrderResponse) {
    super('WEBVIEW_REQUIRED');
    this.name = 'WebViewPaymentRequired';
    this.checkoutUrl = checkoutUrl;
    this.order = order;
  }
}
