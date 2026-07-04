import { Request, Response } from 'express';
import * as authService from './auth.service';

export async function requestOtp(req: Request, res: Response) {
  await authService.requestOtp(req.body.phone);
  res.json({ ok: true });
}

export async function verifyCustomerOtp(req: Request, res: Response) {
  const result = await authService.verifyCustomerOtp(
    req.body.phone,
    req.body.otp,
  );
  res.json(result);
}

export async function verifyDriverOtp(req: Request, res: Response) {
  const result = await authService.verifyDriverOtp(req.body.phone, req.body.otp);
  res.json(result);
}

export async function adminLogin(req: Request, res: Response) {
  const result = await authService.adminLogin(req.body.email, req.body.password);
  res.json(result);
}
