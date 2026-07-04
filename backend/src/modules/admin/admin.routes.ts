import { Router } from 'express';
import { requireAdmin } from '../../middleware/requireAdmin';
import { asyncHandler } from '../../utils/asyncHandler';
import * as controller from './admin.controller';

const router = Router();

router.use(requireAdmin);

// Dashboard
router.get('/dashboard', asyncHandler(controller.dashboard));

// Driver approvals
router.get('/drivers', asyncHandler(controller.listDrivers));
router.post('/drivers/:id/approve', asyncHandler(controller.approveDriver));
router.post('/drivers/:id/reject', asyncHandler(controller.rejectDriver));

// Subscription plans
router.get('/plans', asyncHandler(controller.listPlans));
router.post('/plans', asyncHandler(controller.createPlan));
router.patch('/plans/:id', asyncHandler(controller.updatePlan));
router.delete('/plans/:id', asyncHandler(controller.deletePlan));

// Fare config
router.get('/fare-config', asyncHandler(controller.listFareConfigs));
router.put('/fare-config', asyncHandler(controller.upsertFareConfig));

// Settings
router.get('/settings', asyncHandler(controller.getSettings));
router.patch('/settings', asyncHandler(controller.updateSettings));

// Subscriptions overview
router.get('/subscriptions', asyncHandler(controller.listSubscriptions));

export default router;
