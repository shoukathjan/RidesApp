import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as controller from './auth.controller';

const router = Router();

router.post('/request-otp', asyncHandler(controller.requestOtp));
router.post('/customer/verify-otp', asyncHandler(controller.verifyCustomerOtp));
router.post('/driver/verify-otp', asyncHandler(controller.verifyDriverOtp));
router.post('/admin/login', asyncHandler(controller.adminLogin));

export default router;
