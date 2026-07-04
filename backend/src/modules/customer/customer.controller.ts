import { Request, Response } from 'express';
import * as customerService from './customer.service';

export async function getProfile(req: Request, res: Response) {
  res.json(await customerService.getProfile(req.auth!.sub));
}

export async function updateProfile(req: Request, res: Response) {
  res.json(await customerService.updateProfile(req.auth!.sub, req.body));
}
