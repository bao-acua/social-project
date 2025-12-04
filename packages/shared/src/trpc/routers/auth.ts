import { z } from 'zod';


export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be at most 100 characters'),
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be at most 100 characters'),
  role: z.enum(['user', 'admin']).default('user'),
});

export type RegisterSchemaInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginSchemaInput = z.infer<typeof loginSchema>;


export const tokenPayloadResponseSchema = z.object({
  userId: z.string(),
  username: z.string(),
  role: z.enum(['user', 'admin']),
});

export type TokenPayload = z.infer<typeof tokenPayloadResponseSchema>;

export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    username: z.string(),
    fullName: z.string(),
    initials: z.string(),
    role: z.enum(['user', 'admin']),
  }),
  token: z.string(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;


export const userResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string(),
  initials: z.string(),
  role: z.enum(['user', 'admin']),
});

export type UserResponse = z.infer<typeof userResponseSchema>;