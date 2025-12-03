import { pgTable, uuid, varchar, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { sql, type SQL } from 'drizzle-orm';
import { tsvector } from './utils/tsvector';

// User role enum: admin or user
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 100 }).notNull(),
  initials: varchar('initials', { length: 10 }).notNull().default(''),
  role: userRoleEnum('role').notNull().default('user'),

  searchVector: tsvector('search_vector')
    .generatedAlwaysAs(
      (): SQL => sql`to_tsvector('english', coalesce(username, '') || ' ' || coalesce(full_name, '') || ' ' || coalesce(display_name, ''))`
    ),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  searchIdx: index('users_search_idx').using('gin', table.searchVector),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;