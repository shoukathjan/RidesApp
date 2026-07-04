import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as configService from './config.service';

const router = Router();

/** Public white-label config for all client apps. */
router.get('/config', asyncHandler(async (_req, res) => {
  res.json(await configService.getPublicConfig());
}));

export default router;
