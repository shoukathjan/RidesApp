import { NextFunction, Request, Response } from 'express';
import { Role, TokenPayload, verifyToken } from '../utils/jwt';
import { unauthorized } from '../utils/http';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: TokenPayload;
    }
  }
}

/** Requires a valid JWT; optionally restricts to specific roles. */
export const requireAuth =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return next(unauthorized('Missing bearer token'));
    }
    try {
      const payload = verifyToken(header.slice('Bearer '.length));
      if (roles.length && !roles.includes(payload.role)) {
        return next(unauthorized('Insufficient role'));
      }
      req.auth = payload;
      return next();
    } catch {
      return next(unauthorized('Invalid or expired token'));
    }
  };
