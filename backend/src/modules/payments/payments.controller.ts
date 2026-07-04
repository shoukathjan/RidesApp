import { Request, Response } from 'express';
import * as paymentsService from './payments.service';

/** Razorpay Standard Checkout — create order (amount in paise). */
export async function createOrder(req: Request, res: Response) {
  res.json(await paymentsService.createCheckoutOrder(req.body));
}

/** Razorpay Standard Checkout — verify HMAC signature after payment. */
export async function verifyPayment(req: Request, res: Response) {
  res.json(await paymentsService.verifyCheckoutPayment(req.body));
}
