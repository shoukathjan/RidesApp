import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { requireActiveDriver } from '../../middleware/requireActiveDriver';
import { asyncHandler } from '../../utils/asyncHandler';
import * as controller from './booking.controller';

const router = Router();

// Customer
router.post(
  '/estimate',
  requireAuth('customer', 'driver'),
  asyncHandler(controller.estimateFare),
);
router.post('/', requireAuth('customer'), asyncHandler(controller.createBooking));
router.get('/history', requireAuth('customer'), asyncHandler(controller.history));

// Driver feed + claim/lifecycle (gated by approval + active subscription)
router.get(
  '/requests',
  requireAuth('driver'),
  requireActiveDriver,
  asyncHandler(controller.rideRequests),
);
router.post(
  '/:id/accept',
  requireAuth('driver'),
  requireActiveDriver,
  asyncHandler(controller.accept),
);
router.post(
  '/:id/arrived',
  requireAuth('driver'),
  requireActiveDriver,
  asyncHandler(controller.arrived),
);
router.post(
  '/:id/start',
  requireAuth('driver'),
  requireActiveDriver,
  asyncHandler(controller.start),
);
router.post(
  '/:id/complete',
  requireAuth('driver'),
  requireActiveDriver,
  asyncHandler(controller.complete),
);

// Shared
router.get('/:id', requireAuth('customer', 'driver'), asyncHandler(controller.getBooking));
router.post('/:id/cancel', requireAuth('customer', 'driver'), asyncHandler(controller.cancel));

export default router;
