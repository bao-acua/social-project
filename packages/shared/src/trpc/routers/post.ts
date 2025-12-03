import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Post content cannot be empty')
    .max(5000, 'Post content must be at most 5000 characters')
    .trim(),
});

export const updatePostSchema = z.object({
  content: z
    .string()
    .min(1, 'Post content cannot be empty')
    .max(5000, 'Post content must be at most 5000 characters')
    .trim(),
});

export const postIdParamSchema = z.object({
  id: z.string().uuid('Invalid post ID format'),
});

export const timelineQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => val >= 1 && val <= 100, {
      message: 'Limit must be between 1 and 100',
    }),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .refine((val) => val >= 0, {
      message: 'Offset must be 0 or greater',
    }),
  includeDeleted: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),
});