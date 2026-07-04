import crypto from 'crypto';
import { env } from '../config/env';

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
}

export interface PaymentProvider {
  readonly id: 'razorpay';
  createOrder(amountInr: number, receipt: string): Promise<PaymentOrder>;
  createOrderPaise(amountPaise: number, receipt: string): Promise<PaymentOrder>;
  verifyPayment(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean;
  publicKeyId(): string;
}

export function signCheckoutToken(subscriptionId: string, driverId: string): string {
  const payload = `${subscriptionId}:${driverId}:${Date.now()}`;
  const sig = crypto
    .createHmac('sha256', env.jwtSecret)
    .update(payload)
    .digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

export function verifyCheckoutToken(
  token: string,
  subscriptionId: string,
): { driverId: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const [subId, drvId, ts, sig] = decoded.split(':');
    if (subId !== subscriptionId) return null;
    const age = Date.now() - Number(ts);
    if (!Number.isFinite(age) || age > 15 * 60 * 1000) return null;
    const expected = crypto
      .createHmac('sha256', env.jwtSecret)
      .update(`${subId}:${drvId}:${ts}`)
      .digest('hex');
    if (expected !== sig) return null;
    return { driverId: drvId };
  } catch {
    return null;
  }
}
