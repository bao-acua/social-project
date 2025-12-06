CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"initials" varchar(10) DEFAULT '' NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', coalesce(username, '') || ' ' || coalesce(full_name, ''))) STORED,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"author_id" uuid NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"is_edited" boolean DEFAULT false NOT NULL,
	"edited_at" timestamp with time zone,
	"edited_by" uuid,
	"search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"post_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"parent_comment_id" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"is_edited" boolean DEFAULT false NOT NULL,
	"edited_at" timestamp with time zone,
	"edited_by" uuid,
	"search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar(500) NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_agent" varchar(500),
	"ip_address" varchar(50),
	"is_revoked" boolean DEFAULT false NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_edited_by_users_id_fk" FOREIGN KEY ("edited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_comments_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_edited_by_users_id_fk" FOREIGN KEY ("edited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_search_idx" ON "users" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "posts_author_id_idx" ON "posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "posts_is_deleted_idx" ON "posts" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "posts_search_idx" ON "posts" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "comments_post_id_idx" ON "comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "comments_author_id_idx" ON "comments" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "comments_parent_comment_id_idx" ON "comments" USING btree ("parent_comment_id");--> statement-breakpoint
CREATE INDEX "comments_created_at_idx" ON "comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "comments_is_deleted_idx" ON "comments" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "comments_search_idx" ON "comments" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_idx" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "refresh_tokens_expires_idx" ON "refresh_tokens" USING btree ("expires_at");