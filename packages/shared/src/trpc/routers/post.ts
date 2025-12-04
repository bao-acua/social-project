import { z } from "zod";
import { userResponseSchema } from "./auth";

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Post content cannot be empty')
    .max(5000, 'Post content must be at most 5000 characters')
    .trim(),
});

export type CreatePostInputSchema = z.infer<typeof createPostSchema>;

export const updatePostInputSchema = z.object({
  id: z.string().uuid('Invalid post ID format'),
  content: z
    .string()
    .min(1, 'Post content cannot be empty')
    .max(5000, 'Post content must be at most 5000 characters')
    .trim(),
});

export type UpdatePostInputSchema = z.infer<typeof updatePostInputSchema>;

export const postIdParamSchema = z.object({
  id: z.string().uuid('Invalid post ID format'),
});

export type PostIdParamSchema = z.infer<typeof postIdParamSchema>;

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

export type TimelineQuerySchemaInput = z.infer<typeof timelineQuerySchema>;


export const postResponseSchema = z.object({
  id: z.string(),
  content: z.string(),
  author: z.nullable(userResponseSchema),
  isDeleted: z.boolean(),
  isEdited: z.boolean(),
  editedAt: z.date().nullable(),
  editedByAdmin: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  commentsCount: z.number(),
});

export const paginationResponseSchema = z.object({
  limit: z.number(),
  offset: z.number(),
  total: z.number(),
});

export type PostResponse = z.infer<typeof postResponseSchema>;

export const timelineResponseSchema = z.object({
  posts: z.array(postResponseSchema).default([]),
  pagination: paginationResponseSchema,
});

export type TimelineResponse = z.infer<typeof timelineResponseSchema>;

export const createPostResponseSchema = z.object({
  post: postResponseSchema,
});

export type CreatePostResponse = z.infer<typeof createPostResponseSchema>;

export const updatePostResponseSchema = z.object({
  post: postResponseSchema,
});

export type UpdatePostResponse = z.infer<typeof updatePostResponseSchema>;

