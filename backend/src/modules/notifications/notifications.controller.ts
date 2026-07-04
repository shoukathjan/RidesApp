import { Request, Response } from 'express';
import * as notificationsService from './notifications.service';

export async function list(req: Request, res: Response) {
  res.json(await notificationsService.list(req.auth!.sub));
}

export async function markRead(req: Request, res: Response) {
  res.json(await notificationsService.markRead(req.auth!.sub, req.params.id));
}
