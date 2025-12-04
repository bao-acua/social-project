import { TRPCError } from "@trpc/server";
import { CreateResourceError, ValidationError } from "../../lib/errors";
import { DBClient } from "../../infrastructure/database/connection";
import { validatePasswordStrength } from "../../lib/password/password-validator";
import { RegisterSchemaInput } from "@shared/trpc/routers/auth";
import { hashPassword } from "../../lib/password/password";
import { createUser, findUserByUsername } from "./repository/user.repository";
import { generateUserInitials } from "../../lib/user/initials";
import { generateAccessToken } from "../../lib/password/jwt";

export async function register(db: DBClient, input: RegisterSchemaInput): Promise<AuthResponse> {
  const passwordValidation = validatePasswordStrength(input.password);

  if (!passwordValidation.valid) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Weak password',
      cause: new ValidationError('Weak password'),
    });
  }

  const existingUser = await findUserByUsername(db, input.username);

  if (existingUser) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Username already exists',
      cause: new ValidationError('Username already exists'),
    });
  }

  const hashedPassword = await hashPassword(input.password);

  // Create the user
  const newUser = await createUser(db, {
    username: input.username,
    password: hashedPassword,
    fullName: input.fullName,
    initials: generateUserInitials(input.fullName),
    role: input.role || 'user',
  });

  if (!newUser) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Failed to create user',
      cause: new CreateResourceError('Failed to create user'),
    });
  }

  const accessToken = generateAccessToken({
    userId: newUser.id,
    username: newUser.username,
    role: newUser.role,
  });


  return {
    user: {
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role,
    },
    token: accessToken,
  };
}