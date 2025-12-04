import { TRPCError } from "@trpc/server";
import { DBClient } from "../../infrastructure/database/connection";
import { findUserById } from "./repository/user.repository";
import { ResourceNotFoundError } from "../../lib/errors";
import { UserResponse } from "@shared/trpc/routers/auth";

export async function me(db: DBClient, userId: string): Promise<UserResponse> {
  const user = await findUserById(db, userId);
  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'User not found',
      cause: new ResourceNotFoundError('User not found', { type: 'user', id: userId }),
    });
  }
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    initials: user.initials,
    role: user.role,
  };
}