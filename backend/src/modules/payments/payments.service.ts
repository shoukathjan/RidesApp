import { getPaymentProvider } from '../../payments/registry';
import { badRequest } from '../../utils/http';

export async function createCheckoutOrder(input: {
  amount: number;
  currency?: string;
  receipt?: string;
}) {
  const amountPaise = Math.round(input.amount);
  if (!Number.isFinite(amountPaise) || amountPaise < 100) {
    throw badRequest('amount must be at least 100 paise');
  }

  const currency = input.currency ?? 'INR';
  if (currency !== 'INR') {
    throw badRequest('Only INR currency is supported');
  }

  const receipt = (input.receipt?.trim() || `rcpt_${Date.now()}`).slice(0, 40);

  const provider = getPaymentProvider();
  const order = await provider.createOrderPaise(amountPaise, receipt);

  return {
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    key_id: provider.publicKeyId(),
  };
}

export function verifyCheckoutPayment(input: {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  orderId?: string;
  paymentId?: string;
  signature?: string;
}) {
  const orderId = input.razorpay_order_id ?? input.orderId;
  const paymentId = input.razorpay_payment_id ?? input.paymentId;
  const signature = input.razorpay_signature ?? input.signature;

  if (!orderId || !paymentId || !signature) {
    throw badRequest('order_id, payment_id, and signature are required');
  }

  const provider = getPaymentProvider();
  const valid = provider.verifyPayment({ orderId, paymentId, signature });
  if (!valid) {
    throw badRequest('Payment signature verification failed');
  }

  return {
    success: true,
    orderId,
    paymentId,
  };
}
