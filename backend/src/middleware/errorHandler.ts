import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/http';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  const statusErr = err as Error & { status?: number };
  if (statusErr?.status && statusErr.message) {
    res.status(statusErr.status).json({ error: statusErr.message });
    return;
  }
  // eslint-disable-next-line no-console
  console.error('[error]', err);
  res.status(500).json({ error: 'Internal server error' });
}
