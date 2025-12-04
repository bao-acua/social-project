import { pgTable, uuid, timestamp, index, text, boolean } from 'drizzle-orm/pg-core';
import { posts } from './posts';
import { users } from './users';
import { sql, type SQL } from 'drizzle-orm';
import { tsvector } from './utils/tsvector';


export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentCommentId: uuid('parent_comment_id').references((): any => comments.id, { onDelete: 'cascade' }),
  isDeleted: boolean('is_deleted').notNull().default(false),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: uuid('deleted_by').references(() => users.id),

  isEdited: boolean('is_edited').notNull().default(false),
  editedAt: timestamp('edited_at', { withTimezone: true }),
  editedBy: uuid('edited_by').references(() => users.id),

  searchVector: tsvector('search_vector')
    .generatedAlwaysAs(
      (): SQL => sql`to_tsvector('english', coalesce(content, ''))`
    ),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  postIdIdx: index('comments_post_id_idx').on(table.postId),
  authorIdIdx: index('comments_author_id_idx').on(table.authorId),
  parentCommentIdIdx: index('comments_parent_comment_id_idx').on(table.parentCommentId),
  createdAtIdx: index('comments_created_at_idx').on(table.createdAt),
  isDeletedIdx: index('comments_is_deleted_idx').on(table.isDeleted),
  searchIdx: index('comments_search_idx').using('gin', table.searchVector),
}));

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;