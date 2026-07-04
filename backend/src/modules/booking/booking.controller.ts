import { Request, Response } from 'express';
import { VehicleType, VEHICLE_TYPES } from '@useme/shared';
import { badRequest } from '../../utils/http';
import * as driverService from '../driver/driver.service';
import * as bookingService from './booking.service';

function parseCoords(raw: unknown, label: string) {
  if (!raw || typeof raw !== 'object') {
    throw badRequest(`${label} coordinates are required`);
  }
  const lat = Number((raw as { lat?: unknown }).lat);
  const lng = Number((raw as { lng?: unknown }).lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw badRequest(`${label} coordinates are invalid`);
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw badRequest(`${label} coordinates are out of range`);
  }
  return { lat, lng };
}

function parseVehicleType(raw: unknown): VehicleType {
  if (typeof raw !== 'string' || !VEHICLE_TYPES.includes(raw as VehicleType)) {
    throw badRequest('vehicleType is invalid');
  }
  return raw as VehicleType;
}

function parseCoordsQuery(req: Request): { lat: number; lng: number } | undefined {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  return { lat, lng };
}

export async function estimateFare(req: Request, res: Response) {
  const vehicleType = parseVehicleType(req.body?.vehicleType);
  const pickup = parseCoords(req.body?.pickup, 'Pickup');
  const destination = parseCoords(req.body?.destination, 'Destination');
  res.json(await bookingService.estimateFare(vehicleType, pickup, destination));
}

export async function createBooking(req: Request, res: Response) {
  res.status(201).json(
    await bookingService.createBooking(req.auth!.sub, req.body),
  );
}

export async function getBooking(req: Request, res: Response) {
  res.json(await bookingService.getBooking(req.params.id));
}

export async function history(req: Request, res: Response) {
  res.json(await bookingService.listCustomerHistory(req.auth!.sub));
}

export async function rideRequests(req: Request, res: Response) {
  const coords = parseCoordsQuery(req);
  if (coords) {
    await driverService.updateLocation(req.auth!.sub, coords);
  }
  res.json(await bookingService.listRideRequestsForDriver(req.auth!.sub));
}

export async function accept(req: Request, res: Response) {
  res.json(await bookingService.acceptBooking(req.auth!.sub, req.params.id));
}

export async function arrived(req: Request, res: Response) {
  res.json(await bookingService.markArrived(req.auth!.sub, req.params.id));
}

export async function start(req: Request, res: Response) {
  res.json(await bookingService.startRide(req.auth!.sub, req.params.id));
}

export async function complete(req: Request, res: Response) {
  res.json(await bookingService.completeRide(req.auth!.sub, req.params.id));
}

export async function cancel(req: Request, res: Response) {
  res.json(
    await bookingService.cancelBooking(
      { role: req.auth!.role as 'customer' | 'driver', id: req.auth!.sub },
      req.params.id,
    ),
  );
}
