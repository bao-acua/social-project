import { z } from "zod";
import { userResponseSchema } from "./auth";

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment content cannot be empty')
    .max(2000, 'Comment content must be at most 2000 characters')
    .trim(),
  parentCommentId: z.string().uuid().optional().nullable(),
});

export type CreateCommentInputSchema = z.infer<typeof createCommentSchema>;

export const createCommentInputSchema = z.object({
  postId: z.string().uuid('Invalid post ID format'),
  content: z
    .string()
    .min(1, 'Comment content cannot be empty')
    .max(2000, 'Comment content must be at most 2000 characters')
    .trim(),
  parentCommentId: z.string().uuid().optional().nullable(),
});

export type CreateCommentInputSchemaWithPostId = z.infer<typeof createCommentInputSchema>;

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment content cannot be empty')
    .max(2000, 'Comment content must be at most 2000 characters')
    .trim(),
});

export type UpdateCommentInputSchema = z.infer<typeof updateCommentSchema>;

export const updateCommentInputSchema = z.object({
  id: z.string().uuid('Invalid comment ID format'),
  content: z
    .string()
    .min(1, 'Comment content cannot be empty')
    .max(2000, 'Comment content must be at most 2000 characters')
    .trim(),
});

export type UpdateCommentInputSchemaWithId = z.infer<typeof updateCommentInputSchema>;

export const commentIdParamSchema = z.object({
  id: z.string().uuid('Invalid comment ID format'),
});

export type CommentIdParamSchema = z.infer<typeof commentIdParamSchema>;

export const postIdParamSchema = z.object({
  postId: z.string().uuid('Invalid post ID format'),
});

export type PostIdParamSchema = z.infer<typeof postIdParamSchema>;

export const commentQuerySchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export const getCommentsByPostInputSchema = z.object({
  postId: z.string().uuid('Invalid post ID format'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export type GetCommentsByPostInputSchema = z.infer<typeof getCommentsByPostInputSchema>;

export type CommentQuerySchemaInput = z.infer<typeof commentQuerySchema>;

export const commentResponseSchema = z.object({
  id: z.string(),
  content: z.string(),
  author: userResponseSchema,
  postId: z.string(),
  parentCommentId: z.string().nullable(),
  isDeleted: z.boolean(),
  isEdited: z.boolean(),
  editedAt: z.date().nullable(),
  editedByAdmin: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CommentResponse = z.infer<typeof commentResponseSchema>;

export const paginationResponseSchema = z.object({
  limit: z.number(),
  offset: z.number(),
  total: z.number(),
});

export type PaginationResponse = z.infer<typeof paginationResponseSchema>;

export const commentsByPostResponseSchema = z.object({
  comments: z.array(commentResponseSchema).default([]),
  pagination: paginationResponseSchema,
});

export type CommentsByPostResponse = z.infer<typeof commentsByPostResponseSchema>;

export const createCommentResponseSchema = z.object({
  comment: commentResponseSchema,
});

export type CreateCommentResponse = z.infer<typeof createCommentResponseSchema>;

export const updateCommentResponseSchema = z.object({
  comment: commentResponseSchema,
});

export type UpdateCommentResponse = z.infer<typeof updateCommentResponseSchema>;
