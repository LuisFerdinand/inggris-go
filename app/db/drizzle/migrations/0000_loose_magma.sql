CREATE TYPE "public"."program_batch_mode" AS ENUM('online', 'offline', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."program_batch_status" AS ENUM('draft', 'open', 'ongoing', 'full', 'closed', 'completed');--> statement-breakpoint
CREATE TYPE "public"."program_category_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."program_format" AS ENUM('online', 'offline', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."program_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."program_schedule_type" AS ENUM('permanent', 'scheduled');--> statement-breakpoint
CREATE TYPE "public"."program_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."registration_type" AS ENUM('online', 'offline');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('guest', 'user', 'teacher', 'author', 'admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."coupon_type" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('pending_payment', 'paid', 'confirmed', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."enrollment_type" AS ENUM('online', 'offline');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('qris', 'virtual_account', 'credit_card', 'ewallet', 'bank_transfer');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'expired', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TABLE "program_batches" (
	"id" text PRIMARY KEY NOT NULL,
	"program_id" text NOT NULL,
	"teacher_id" text,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"status" "program_batch_status" DEFAULT 'draft' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"registration_deadline" timestamp,
	"capacity" integer,
	"enrolled_count" integer DEFAULT 0 NOT NULL,
	"mode" "program_batch_mode" DEFAULT 'online' NOT NULL,
	"location" text,
	"schedules" jsonb,
	"timezone" text DEFAULT 'WIB',
	"notes" text,
	"brochure_url" text,
	"primary_cta_label" text,
	"primary_cta_href" text,
	"secondary_cta_label" text,
	"secondary_cta_href" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "program_batches_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "program_categories" (
	"id" text PRIMARY KEY NOT NULL,
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
	"updated_at" timestamp,
	CONSTRAINT "program_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "program_content" (
	"id" text PRIMARY KEY NOT NULL,
	"program_id" text NOT NULL,
	"theme" jsonb,
	"is_published" boolean DEFAULT false NOT NULL,
	"sections" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "program_content_program_id_unique" UNIQUE("program_id")
);
--> statement-breakpoint
CREATE TABLE "program_packages" (
	"id" text PRIMARY KEY NOT NULL,
	"program_id" text NOT NULL,
	"batch_id" text,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"original_price" integer,
	"is_default" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"features" jsonb
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"short_desc" text,
	"schedule_type" "program_schedule_type" DEFAULT 'permanent' NOT NULL,
	"category_id" text NOT NULL,
	"status" "program_status" DEFAULT 'draft' NOT NULL,
	"registration_type" "registration_type" DEFAULT 'online' NOT NULL,
	"order" integer DEFAULT 0,
	"starting_price" integer,
	"starting_original_price" integer,
	"badge" text,
	"highlight" text,
	"tags" jsonb,
	"icon" text,
	"thumbnail_url" text,
	"thumbnail_key" text,
	"thumbnail_blur_data_url" text,
	"duration" integer,
	"level" "program_level" DEFAULT 'beginner' NOT NULL,
	"format" "program_format" DEFAULT 'online' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "programs_slug_unique" UNIQUE("slug")
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
	"password_hash" text,
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
CREATE TABLE "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" "role" NOT NULL,
	"description" text,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_role" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_role_user_id_role_id_unique" UNIQUE("user_id","role_id")
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
CREATE TABLE "coupon_usages" (
	"id" text PRIMARY KEY NOT NULL,
	"coupon_id" text NOT NULL,
	"enrollment_id" text NOT NULL,
	"user_id" text,
	"discount_amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text,
	"name" text NOT NULL,
	"description" text,
	"type" "coupon_type" NOT NULL,
	"discount_type" "discount_type" NOT NULL,
	"discount_value" integer NOT NULL,
	"max_discount" integer,
	"minimum_purchase" integer,
	"starts_at" timestamp,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"max_total_usage" integer,
	"max_usage_per_user" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"assigned_user_id" text,
	"rules" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" text PRIMARY KEY NOT NULL,
	"program_id" text NOT NULL,
	"batch_id" text,
	"package_id" text NOT NULL,
	"user_id" text,
	"schedule_type" "program_schedule_type" NOT NULL,
	"program_snapshot" jsonb,
	"batch_snapshot" jsonb,
	"package_snapshot" jsonb,
	"type" "enrollment_type" NOT NULL,
	"customer_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"child_name" text,
	"age" integer,
	"data" jsonb NOT NULL,
	"attachments" jsonb,
	"metadata" jsonb,
	"source" text DEFAULT 'web',
	"is_manual" boolean DEFAULT false NOT NULL,
	"status" "enrollment_status" DEFAULT 'pending_payment' NOT NULL,
	"coupon_code" text,
	"coupon_snapshot" jsonb,
	"discount_amount" integer DEFAULT 0 NOT NULL,
	"subtotal_price" integer NOT NULL,
	"final_price" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "payment_webhooks" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text DEFAULT 'doku' NOT NULL,
	"event_type" text,
	"signature" text,
	"payload" jsonb NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"enrollment_id" text NOT NULL,
	"provider" text DEFAULT 'doku' NOT NULL,
	"payment_method" "payment_method",
	"invoice_number" text NOT NULL,
	"doku_invoice_id" text,
	"payment_url" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"expired_at" timestamp,
	"request_payload" jsonb,
	"response_payload" jsonb,
	"callback_payload" jsonb,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "program_batches" ADD CONSTRAINT "program_batches_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_batches" ADD CONSTRAINT "program_batches_teacher_id_user_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_content" ADD CONSTRAINT "program_content_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_packages" ADD CONSTRAINT "program_packages_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_packages" ADD CONSTRAINT "program_packages_batch_id_program_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."program_batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_category_id_program_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."program_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_like" ADD CONSTRAINT "post_like_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_like" ADD CONSTRAINT "post_like_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_save" ADD CONSTRAINT "post_save_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_save" ADD CONSTRAINT "post_save_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tag" ADD CONSTRAINT "post_tag_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tag" ADD CONSTRAINT "post_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_view" ADD CONSTRAINT "post_view_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_assigned_user_id_user_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_batch_id_program_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."program_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_package_id_program_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."program_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "user_role_user_idx" ON "user_role" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_role_role_idx" ON "user_role" USING btree ("role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "post_like_unique" ON "post_like" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "post_save_unique" ON "post_save" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE INDEX "enrollments_program_id_idx" ON "enrollments" USING btree ("program_id");--> statement-breakpoint
CREATE INDEX "enrollments_batch_id_idx" ON "enrollments" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "enrollments_package_id_idx" ON "enrollments" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "enrollments_status_idx" ON "enrollments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "enrollments_created_at_idx" ON "enrollments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payments_enrollment_idx" ON "payments" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "payments_invoice_idx" ON "payments" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "payments_doku_invoice_idx" ON "payments" USING btree ("doku_invoice_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");