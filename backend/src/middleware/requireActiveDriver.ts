import { ApprovalStatus } from '@useme/shared';
import { NextFunction, Request, Response } from 'express';
import { DriverModel } from '../models/Driver';
import { forbidden, unauthorized } from '../utils/http';

/**
 * Ensures the authenticated driver is APPROVED and has a non-expired
 * subscription before allowing ride write actions (accept/start/complete).
 */
export async function requireActiveDriver(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (req.auth?.role !== 'driver') {
      return next(unauthorized('Driver token required'));
    }
    const driver = await DriverModel.findById(req.auth.sub);
    if (!driver) return next(unauthorized('Driver not found'));

    if (driver.approvalStatus !== ApprovalStatus.APPROVED) {
      return next(forbidden('Driver registration is not approved yet'));
    }
    const validUntil = driver.subscriptionValidUntil;
    if (!validUntil || validUntil.getTime() <= Date.now()) {
      return next(forbidden('No active subscription'));
    }
    return next();
  } catch (err) {
    return next(err);
  }
}
