import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export type Role = 'customer' | 'driver' | 'admin';

export interface TokenPayload {
  sub: string; // entity id
  role: Role;
}

export function signToken(payload: TokenPayload): string {
  const options = { expiresIn: env.jwtExpiresIn } as SignOptions;
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}
