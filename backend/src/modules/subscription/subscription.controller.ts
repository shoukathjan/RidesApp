import { VehicleType } from '@useme/shared';
import { Request, Response } from 'express';
import * as subscriptionService from './subscription.service';

export async function listPlans(req: Request, res: Response) {
  const vehicleType = req.query.vehicleType as VehicleType | undefined;
  if (vehicleType) {
    res.json(await subscriptionService.listPlans(vehicleType));
    return;
  }
  res.json(await subscriptionService.listPlansForDriver(req.auth!.sub));
}

export async function createOrder(req: Request, res: Response) {
  res.json(
    await subscriptionService.createOrder(req.auth!.sub, req.body.planId),
  );
}

export async function verifyPayment(req: Request, res: Response) {
  res.json(await subscriptionService.verifyPayment(req.auth!.sub, req.body));
}

export async function mySubscriptions(req: Request, res: Response) {
  res.json(await subscriptionService.mySubscriptions(req.auth!.sub));
}

export async function checkoutPage(req: Request, res: Response) {
  const html = await subscriptionService.renderCheckoutPage(
    req.params.subscriptionId,
    String(req.query.token ?? ''),
  );
  res.type('html').send(html);
}

export async function checkoutComplete(req: Request, res: Response) {
  const html = await subscriptionService.renderCheckoutCompletePageWithPayment(
    req.params.subscriptionId,
    String(req.query.token ?? ''),
    String(req.query.paymentId ?? ''),
    String(req.query.signature ?? ''),
  );
  res.type('html').send(html);
}
