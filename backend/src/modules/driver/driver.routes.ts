import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import * as controller from './driver.controller';

const router = Router();

// Public: registration (creates a PENDING driver for admin approval)
router.post('/register', asyncHandler(controller.register));

// Authenticated driver
router.use(requireAuth('driver'));
router.get('/me', asyncHandler(controller.getProfile));
router.patch('/me', asyncHandler(controller.updateProfile));
router.get('/me/access', asyncHandler(controller.access));
router.get('/me/active-ride', asyncHandler(controller.getActiveRide));
router.get('/me/rides', asyncHandler(controller.rideHistory));
router.post('/online', asyncHandler(controller.goOnline));
router.post('/offline', asyncHandler(controller.goOffline));
router.post('/location', asyncHandler(controller.updateLocation));
router.get('/earnings', asyncHandler(controller.earnings));

export default router;
