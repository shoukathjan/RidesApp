import { DriverStatus } from '@useme/shared';
import { Request, Response } from 'express';
import { getActiveRideForDriver, listDriverHistory } from '../booking/booking.service';
import * as driverService from './driver.service';

export async function register(req: Request, res: Response) {
  res.status(201).json(await driverService.register(req.body));
}

export async function getProfile(req: Request, res: Response) {
  res.json(await driverService.getProfile(req.auth!.sub));
}

export async function updateProfile(req: Request, res: Response) {
  res.json(await driverService.updateProfile(req.auth!.sub, req.body));
}

export async function goOnline(req: Request, res: Response) {
  res.json(
    await driverService.setOnlineStatus(
      req.auth!.sub,
      DriverStatus.ONLINE,
      req.body.location,
    ),
  );
}

export async function goOffline(req: Request, res: Response) {
  res.json(
    await driverService.setOnlineStatus(req.auth!.sub, DriverStatus.OFFLINE),
  );
}

export async function updateLocation(req: Request, res: Response) {
  res.json(await driverService.updateLocation(req.auth!.sub, req.body.location));
}

export async function earnings(req: Request, res: Response) {
  res.json(await driverService.getEarnings(req.auth!.sub));
}

export async function access(req: Request, res: Response) {
  res.json(await driverService.getAccessState(req.auth!.sub));
}

export async function getActiveRide(req: Request, res: Response) {
  const activeRide = await getActiveRideForDriver(req.auth!.sub);
  res.json({ activeRide });
}

export async function rideHistory(req: Request, res: Response) {
  res.json(await listDriverHistory(req.auth!.sub));
}
