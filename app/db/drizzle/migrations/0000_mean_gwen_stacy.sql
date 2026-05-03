CREATE TYPE "public"."program_category_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."program_format" AS ENUM('online', 'offline', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."program_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."program_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."role_enum" AS ENUM('guest', 'user', 'teacher', 'author', 'admin', 'super_admin');--> statement-breakpoint
CREATE TABLE "batch" (
	"id" text PRIMARY KEY NOT NULL,
	"teacher_id" text NOT NULL,
	"program_id" text NOT NULL,
	"title" text,
	"slug" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"capacity" integer,
	"mode" text,
	"location" text,
	"meeting_days" jsonb,
	"meeting_time" text,
	"status" text DEFAULT 'draft',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"short_label" text,
	"order" integer DEFAULT 0 NOT NULL,
	"status" "program_category_status" DEFAULT 'draft' NOT NULL,
	"icon" text,
	"hero_image" text,
	"tagline" text,
	"tagline_accent" text,
	"description" text,
	"for_who" text,
	"theme_primary" text NOT NULL,
	"pain_points" jsonb,
	"benefits" jsonb,
	"steps" jsonb,
	"experience" jsonb,
	"comparison" jsonb,
	"social_proof" jsonb,
	"cta" jsonb,
	"empty_state" jsonb,
	"quick_decision_label" text,
	"quick_decision_desc" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "program_categories_key_unique" UNIQUE("key"),
	CONSTRAINT "program_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "program_content" (
	"id" text PRIMARY KEY NOT NULL,
	"program_id" text NOT NULL,
	"sections" jsonb,
	"has_batch" boolean DEFAULT false,
	"batches" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "program_content_program_id_unique" UNIQUE("program_id")
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"short_desc" text,
	"category_id" text NOT NULL,
	"status" "program_status" DEFAULT 'draft' NOT NULL,
	"order" integer DEFAULT 0,
	"base_price" integer,
	"original_price" integer,
	"price_tiers" jsonb,
	"badge" text,
	"highlight" text,
	"tags" jsonb,
	"icon" text,
	"thumbnail" text,
	"duration" integer,
	"level" "program_level" DEFAULT 'beginner' NOT NULL,
	"format" "program_format" DEFAULT 'online' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "programs_slug_category_id_unique" UNIQUE("slug","category_id")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" text PRIMARY KEY NOT NULL,
	"name" "role_enum" NOT NULL,
	"description" text,
	CONSTRAINT "role_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_role" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" jsonb,
	"content_html" text,
	"cover_image" text,
	"author_id" text NOT NULL,
	"status" text DEFAULT 'draft',
	"published_at" timestamp,
	"read_time" integer,
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "post_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "post_category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "post_like" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_save" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_tag" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"tag_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_view" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "tag_name_unique" UNIQUE("name"),
	CONSTRAINT "tag_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_teacher_id_user_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_content" ADD CONSTRAINT "program_content_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_category_id_program_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."program_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_like" ADD CONSTRAINT "post_like_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_like" ADD CONSTRAINT "post_like_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_save" ADD CONSTRAINT "post_save_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_save" ADD CONSTRAINT "post_save_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tag" ADD CONSTRAINT "post_tag_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tag" ADD CONSTRAINT "post_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_view" ADD CONSTRAINT "post_view_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "user_role_user_idx" ON "user_role" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_role_role_idx" ON "user_role" USING btree ("role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "post_like_unique" ON "post_like" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "post_save_unique" ON "post_save" USING btree ("post_id","user_id");