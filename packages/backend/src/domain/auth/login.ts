import { DBClient } from "../../infrastructure/database/connection";
import type { AuthResponse, LoginSchemaInput } from "@shared/trpc/routers/auth";
import { generateAccessToken } from "../../lib/password/jwt";
import { comparePassword } from "../../lib/password/password";
import { TRPCError } from "@trpc/server";
import { ResourceNotFoundError } from "../../lib/errors";
import { findUserByUsername } from "./repository/user.repository";


export async function login(db: DBClient, input: LoginSchemaInput): Promise<AuthResponse> {
  const user = await findUserByUsername(db, input.username);

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid username or password',
      cause: new ResourceNotFoundError('User not found', { type: 'user', id: input.username }),
    });
  }

  const isPasswordValid = await comparePassword(input.password, user.password);
  if (!isPasswordValid) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid username or password',
    });
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    username: user.username,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      initials: user.initials,
      role: user.role,
    },
    token: accessToken,
  };
}
