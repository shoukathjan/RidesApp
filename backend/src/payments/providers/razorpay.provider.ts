import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../../config/env';
import { HttpError, unauthorized } from '../../utils/http';
import type { PaymentOrder, PaymentProvider } from '../types';

let client: Razorpay | null = null;

function getClient(): Razorpay {
  if (!client) {
    if (!env.payment.razorpay.keyId || !env.payment.razorpay.keySecret) {
      throw new Error('Razorpay keys are not configured');
    }
    client = new Razorpay({
      key_id: env.payment.razorpay.keyId,
      key_secret: env.payment.razorpay.keySecret,
    });
  }
  return client;
}

function mapRazorpayError(err: unknown): never {
  const e = err as { statusCode?: number; error?: { description?: string } };
  if (e?.statusCode === 401) {
    throw unauthorized('Razorpay authentication failed — check API keys');
  }
  const message =
    e?.error?.description ?? (err instanceof Error ? err.message : 'Razorpay API error');
  throw new HttpError(500, message);
}

const RECEIPT_MAX_LEN = 40;

/** Razorpay receipt ids must be <= 40 characters. */
function normalizeReceipt(receipt: string): string {
  const base = (receipt.trim() || `rcpt_${Date.now()}`).replace(/\s+/g, '');
  return base.length <= RECEIPT_MAX_LEN ? base : base.slice(0, RECEIPT_MAX_LEN);
}

async function createRazorpayOrder(
  amountPaise: number,
  receipt: string,
): Promise<PaymentOrder> {
  try {
    const order = await getClient().orders.create({
      amount: Math.round(amountPaise),
      currency: 'INR',
      receipt: normalizeReceipt(receipt),
    });
    return {
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
    };
  } catch (err) {
    mapRazorpayError(err);
  }
}

export const razorpayProvider: PaymentProvider = {
  id: 'razorpay',

  async createOrder(amountInr: number, receipt: string): Promise<PaymentOrder> {
    return createRazorpayOrder(Math.round(amountInr * 100), receipt);
  },

  async createOrderPaise(amountPaise: number, receipt: string): Promise<PaymentOrder> {
    return createRazorpayOrder(amountPaise, receipt);
  },

  verifyPayment({ orderId, paymentId, signature }: {
    orderId: string;
    paymentId: string;
    signature: string;
  }) {
    const expected = crypto
      .createHmac('sha256', env.payment.razorpay.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return expected === signature;
  },

  publicKeyId() {
    return env.payment.razorpay.keyId;
  },
};
