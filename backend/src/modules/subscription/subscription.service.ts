import { VehicleType } from '@useme/shared';
import { SubscriptionModel } from '../../models/Subscription';
import { SubscriptionPlanModel } from '../../models/SubscriptionPlan';
import { DriverModel } from '../../models/Driver';
import { buildCheckoutUrl, renderCheckoutHtml, renderCheckoutCompleteHtml } from '../../payments/checkoutPage';
import {
  getPaymentProvider,
  signCheckoutToken,
  verifyCheckoutToken,
} from '../../payments/registry';
import { badRequest, notFound, unauthorized } from '../../utils/http';

export async function listPlans(vehicleType?: VehicleType) {
  const filter: Record<string, unknown> = { active: true };
  if (vehicleType) filter.vehicleType = vehicleType;
  return SubscriptionPlanModel.find(filter).sort({ amount: 1 });
}

export async function listPlansForDriver(driverId: string) {
  const driver = await DriverModel.findById(driverId);
  if (!driver) throw notFound('Driver not found');
  return listPlans(driver.vehicleType as VehicleType);
}

export async function createOrder(driverId: string, planId: string) {
  const plan = await SubscriptionPlanModel.findById(planId);
  if (!plan || !plan.active) throw notFound('Plan not found');

  const driver = await DriverModel.findById(driverId);
  if (!driver) throw notFound('Driver not found');
  if (driver.vehicleType !== plan.vehicleType) {
    throw badRequest('Plan vehicle type does not match your vehicle');
  }

  const provider = getPaymentProvider();
  const order = await provider.createOrder(plan.amount, `sub_${Date.now()}`);
  const subscription = await SubscriptionModel.create({
    driverId,
    planId: plan._id,
    vehicleType: plan.vehicleType,
    provider: provider.id,
    providerOrderId: order.id,
    razorpayOrderId: order.id,
    status: 'CREATED',
  });

  const subscriptionId = String(subscription._id);
  const checkoutToken = signCheckoutToken(subscriptionId, driverId);

  return {
    provider: provider.id,
    subscriptionId,
    checkoutUrl: buildCheckoutUrl(subscriptionId, checkoutToken),
    checkoutToken,
    keyId: provider.publicKeyId(),
    order,
    plan: { name: plan.name, amount: plan.amount, durationDays: plan.durationDays },
  };
}

export async function verifyPayment(
  driverId: string,
  input: { subscriptionId: string; paymentId: string; signature: string },
) {
  const subscription = await SubscriptionModel.findById(input.subscriptionId);
  if (!subscription) throw notFound('Subscription not found');
  if (String(subscription.driverId) !== driverId) {
    throw unauthorized('Not your subscription');
  }

  if (subscription.status === 'PAID' && subscription.validUntil) {
    const plan = await SubscriptionPlanModel.findById(subscription.planId);
    return {
      subscriptionValidUntil: subscription.validUntil.toISOString(),
      durationDays: plan?.durationDays ?? 0,
      hasActiveSubscription: true as const,
    };
  }

  if (subscription.status !== 'CREATED' && subscription.status !== 'FAILED') {
    throw badRequest('Subscription is no longer payable');
  }

  const provider = getPaymentProvider();
  const orderId = subscription.providerOrderId ?? subscription.razorpayOrderId ?? '';
  const valid = provider.verifyPayment({
    orderId,
    paymentId: input.paymentId,
    signature: input.signature,
  });
  if (!valid) {
    subscription.status = 'FAILED';
    await subscription.save();
    throw badRequest('Payment signature verification failed');
  }

  const plan = await SubscriptionPlanModel.findById(subscription.planId);
  if (!plan) throw notFound('Plan not found');

  const now = new Date();
  const driver = await DriverModel.findById(driverId);
  if (!driver) throw notFound('Driver not found');

  // Extend from current expiry if still active; otherwise from payment date.
  const hasActive =
    Boolean(driver.subscriptionValidUntil) &&
    driver.subscriptionValidUntil!.getTime() > now.getTime();
  const periodStart = hasActive ? driver.subscriptionValidUntil! : now;
  const validUntil = new Date(periodStart);
  validUntil.setDate(validUntil.getDate() + plan.durationDays);

  subscription.status = 'PAID';
  subscription.providerPaymentId = input.paymentId;
  subscription.razorpayPaymentId = input.paymentId;
  subscription.validFrom = now;
  subscription.validUntil = validUntil;
  await subscription.save();

  driver.subscriptionValidUntil = validUntil;
  await driver.save();

  return {
    subscriptionValidUntil: validUntil.toISOString(),
    durationDays: plan.durationDays,
    hasActiveSubscription: true as const,
  };
}

/** Verify payment using checkout token (WebView complete page — no JWT). */
export async function completeCheckoutFromToken(
  subscriptionId: string,
  token: string,
  paymentId: string,
  signature: string,
) {
  if (!paymentId || !signature) {
    throw badRequest('Missing payment details');
  }
  const parsed = verifyCheckoutToken(token, subscriptionId);
  if (!parsed) {
    throw unauthorized('Invalid or expired checkout token');
  }
  return verifyPayment(parsed.driverId, {
    subscriptionId,
    paymentId,
    signature,
  });
}

export async function mySubscriptions(driverId: string) {
  return SubscriptionModel.find({ driverId }).sort({ createdAt: -1 });
}

export function renderCheckoutCompletePage(): string {
  return renderCheckoutCompleteHtml({ success: false, error: 'Missing payment details' });
}

export async function renderCheckoutCompletePageWithPayment(
  subscriptionId: string,
  token: string,
  paymentId: string,
  signature: string,
): Promise<string> {
  try {
    const result = await completeCheckoutFromToken(
      subscriptionId,
      token,
      paymentId,
      signature,
    );
    return renderCheckoutCompleteHtml({
      success: true,
      subscriptionValidUntil: result.subscriptionValidUntil,
      durationDays: result.durationDays,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Verification failed';
    return renderCheckoutCompleteHtml({ success: false, error: message });
  }
}

export async function renderCheckoutPage(
  subscriptionId: string,
  token: string,
): Promise<string> {
  const parsed = verifyCheckoutToken(token, subscriptionId);
  if (!parsed) {
    throw unauthorized('Invalid or expired checkout token');
  }
  const subscription = await SubscriptionModel.findById(subscriptionId);
  if (!subscription || String(subscription.driverId) !== parsed.driverId) {
    throw notFound('Subscription not found');
  }
  if (subscription.status !== 'CREATED' && subscription.status !== 'FAILED') {
    throw badRequest('Subscription is no longer payable');
  }

  const plan = await SubscriptionPlanModel.findById(subscription.planId);
  if (!plan) throw notFound('Plan not found');

  const provider = getPaymentProvider();
  const orderId = subscription.providerOrderId ?? subscription.razorpayOrderId ?? '';

  return renderCheckoutHtml({
    keyId: provider.publicKeyId(),
    orderId,
    amount: Math.round(plan.amount * 100),
    currency: 'INR',
    name: 'UseMe Driver Subscription',
    description: plan.name,
    subscriptionId,
    checkoutToken: token,
  });
}
