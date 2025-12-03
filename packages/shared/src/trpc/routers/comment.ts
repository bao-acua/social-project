import { z } from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment content cannot be empty')
    .max(2000, 'Comment content must be at most 2000 characters')
    .trim(),
  parentCommentId: z.string().uuid().optional().nullable(),
});


export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment content cannot be empty')
    .max(2000, 'Comment content must be at most 2000 characters')
    .trim(),
});

export const commentIdParamSchema = z.object({
  id: z.string().uuid('Invalid comment ID format'),
});

export const postIdQuerySchema = z.object({
  postId: z.string().uuid('Invalid post ID format'),
});

export const commentQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => Math.min(Math.max(parseInt(val, 10) || 20, 1), 100)),
  offset: z
    .string()
    .optional()
    .default('0')
    .transform((val) => Math.max(parseInt(val, 10) || 0, 0)),
});
