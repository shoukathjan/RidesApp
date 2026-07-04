import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import * as controller from './subscription.controller';

const router = Router();

router.get('/plans', requireAuth('driver'), asyncHandler(controller.listPlans));
router.post('/order', requireAuth('driver'), asyncHandler(controller.createOrder));
router.post('/verify', requireAuth('driver'), asyncHandler(controller.verifyPayment));
router.get('/mine', requireAuth('driver'), asyncHandler(controller.mySubscriptions));
router.get(
  '/checkout/complete/:subscriptionId',
  asyncHandler(controller.checkoutComplete),
);
router.get('/checkout/:subscriptionId', asyncHandler(controller.checkoutPage));

export default router;
