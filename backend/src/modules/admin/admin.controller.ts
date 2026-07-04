import { ApprovalStatus } from '@useme/shared';
import { Request, Response } from 'express';
import * as adminService from './admin.service';

export async function listDrivers(req: Request, res: Response) {
  res.json(
    await adminService.listDrivers(
      req.query.approvalStatus as ApprovalStatus | undefined,
    ),
  );
}

export async function approveDriver(req: Request, res: Response) {
  res.json(await adminService.setApproval(req.params.id, ApprovalStatus.APPROVED));
}

export async function rejectDriver(req: Request, res: Response) {
  res.json(await adminService.setApproval(req.params.id, ApprovalStatus.REJECTED));
}

export async function deleteDriver(req: Request, res: Response) {
  res.json(await adminService.deleteDriver(req.params.id));
}

export async function listPlans(_req: Request, res: Response) {
  res.json(await adminService.listPlans());
}
export async function createPlan(req: Request, res: Response) {
  res.status(201).json(await adminService.createPlan(req.body));
}
export async function updatePlan(req: Request, res: Response) {
  res.json(await adminService.updatePlan(req.params.id, req.body));
}
export async function deletePlan(req: Request, res: Response) {
  res.json(await adminService.deletePlan(req.params.id));
}

export async function listFareConfigs(_req: Request, res: Response) {
  res.json(await adminService.listFareConfigs());
}
export async function upsertFareConfig(req: Request, res: Response) {
  res.json(await adminService.upsertFareConfig(req.body.vehicleType, req.body));
}

export async function getSettings(_req: Request, res: Response) {
  res.json(await adminService.getSettings());
}
export async function updateSettings(req: Request, res: Response) {
  res.json(await adminService.updateSettings(req.body));
}

export async function listSubscriptions(_req: Request, res: Response) {
  res.json(await adminService.listSubscriptions());
}

export async function dashboard(_req: Request, res: Response) {
  res.json(await adminService.dashboard());
}
