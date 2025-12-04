import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { env } from '../../infrastructure/config/env';
import type { TokenPayload } from '@shared/trpc/routers/auth';
import { TRPCError } from '@trpc/server';

const EXPIRATION_TIME = '30m';

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: EXPIRATION_TIME,
  });
}

export function generateRefreshToken(): string {
  return randomBytes(64).toString('hex');
}

export function generateToken(payload: TokenPayload): string {
  return generateAccessToken(payload);
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Token has expired',
      });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid token',
      });
    }
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Token verification failed',
    });
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}
