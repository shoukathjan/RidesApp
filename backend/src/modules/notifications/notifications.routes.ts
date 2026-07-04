import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import * as controller from './notifications.controller';

const router = Router();

router.use(requireAuth('customer', 'driver'));
router.get('/', asyncHandler(controller.list));
router.post('/:id/read', asyncHandler(controller.markRead));

export default router;
