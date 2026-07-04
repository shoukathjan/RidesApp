import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import * as controller from './places.controller';

const router = Router();

router.use(requireAuth('customer'));

router.get('/autocomplete', asyncHandler(controller.autocomplete));
router.get('/reverse', asyncHandler(controller.reverse));

export default router;
