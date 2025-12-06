import { DBClient } from '../../infrastructure/database/connection';
import { UpdateProfileSchemaInput, UserResponse } from '@shared/trpc/routers/auth';
import { updateUserProfile } from './repository/user.repository';
import { generateUserInitials } from '../../lib/user/initials';
import { TRPCError } from '@trpc/server';

export async function updateProfile(
  db: DBClient,
  userId: string,
  input: UpdateProfileSchemaInput
): Promise<UserResponse> {
  const initials = generateUserInitials(input.fullName);

  const updatedUser = await updateUserProfile(db, userId, {
    fullName: input.fullName,
    initials,
  });

  if (!updatedUser) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to update profile',
    });
  }

  return {
    id: updatedUser.id,
    username: updatedUser.username,
    fullName: updatedUser.fullName,
    initials: updatedUser.initials,
    role: updatedUser.role,
  };
}
