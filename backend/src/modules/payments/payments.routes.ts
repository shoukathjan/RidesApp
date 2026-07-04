import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as controller from './payments.controller';

const router = Router();

router.post('/create-order', asyncHandler(controller.createOrder));
router.post('/verify-payment', asyncHandler(controller.verifyPayment));

export default router;
