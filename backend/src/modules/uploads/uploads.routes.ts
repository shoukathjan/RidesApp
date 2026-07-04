import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as controller from './uploads.controller';

const router = Router();

// Public so it can be used during driver registration (before login).
router.post('/presign', asyncHandler(controller.presign));

export default router;
