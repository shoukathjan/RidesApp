import type { CreateSubscriptionOrderResponse } from '@useme/shared';
import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import RazorpayCheckout from 'react-native-razorpay';
import type { PaymentGateway } from '../types';

/** Native Razorpay only works in dev/production builds — not Expo Go. */
export function canUseNativeRazorpay(): boolean {
  if (Platform.OS === 'web') return false;
  if (Constants.appOwnership === 'expo') return false;
  try {
    return NativeModules.RazorpayCheckout != null;
  } catch {
    return false;
  }
}

export const razorpayNativeGateway: PaymentGateway = {
  async startCheckout(order: CreateSubscriptionOrderResponse) {
    const result = await RazorpayCheckout.open({
      key: order.keyId,
      order_id: order.order.id,
      amount: order.order.amount,
      currency: order.order.currency,
      name: 'UseMe Driver Subscription',
      description: order.plan.name,
      theme: { color: '#1C5E78' },
    });
    return {
      subscriptionId: order.subscriptionId,
      paymentId: result.razorpay_payment_id as string,
      signature: result.razorpay_signature as string,
    };
  },
};
