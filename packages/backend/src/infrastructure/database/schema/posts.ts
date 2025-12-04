import { pgTable, uuid, varchar, timestamp, pgEnum, index, customType, text, boolean } from 'drizzle-orm/pg-core';
import { sql, type SQL } from 'drizzle-orm';
import { users } from './users';
import { tsvector } from './utils/tsvector';



export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
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
  authorIdIdx: index('posts_author_id_idx').on(table.authorId),
  createdAtIdx: index('posts_created_at_idx').on(table.createdAt),
  isDeletedIdx: index('posts_is_deleted_idx').on(table.isDeleted),
  searchIdx: index('posts_search_idx').using('gin', table.searchVector),
}));

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;