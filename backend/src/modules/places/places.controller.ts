import { Request, Response } from 'express';
import { badRequest } from '../../utils/http';
import * as placesService from './places.service';

export async function autocomplete(req: Request, res: Response) {
  const q = String(req.query.q ?? '').trim();
  if (!q) throw badRequest('Query parameter q is required');
  const lat = req.query.lat ? String(req.query.lat) : undefined;
  const lng = req.query.lng ? String(req.query.lng) : undefined;
  res.json(await placesService.autocomplete(q, lat, lng));
}

export async function reverse(req: Request, res: Response) {
  const lat = String(req.query.lat ?? '');
  const lng = String(req.query.lng ?? '');
  if (!lat || !lng) throw badRequest('lat and lng are required');
  const place = await placesService.reverseGeocode(lat, lng);
  res.json(place ?? { label: 'Current location', coordinates: { lat: Number(lat), lng: Number(lng) } });
}
