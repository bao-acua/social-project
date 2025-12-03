import { TRPCError } from "@trpc/server";
import { env } from "../config/env";
import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  username: string;
  role: 'user' | 'admin';
}

export async function extractBearerToken(
  authorization: string | undefined
): Promise<string> {
  if (!authorization) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Missing authorization header',
    });
  }

  const parts = authorization.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid authorization header format',
    });
  }

  return parts[1]!;
}




export function verifyAccessToken(token: string): TokenPayload {
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