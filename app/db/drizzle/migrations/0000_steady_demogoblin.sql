CREATE TYPE "public"."program_batch_mode" AS ENUM('online', 'offline', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."program_batch_status" AS ENUM('draft', 'open', 'ongoing', 'full', 'closed', 'completed');--> statement-breakpoint
CREATE TYPE "public"."program_category_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."program_format" AS ENUM('online', 'offline', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."program_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."program_schedule_type" AS ENUM('permanent', 'scheduled');--> statement-breakpoint
CREATE TYPE "public"."program_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."registration_type" AS ENUM('online', 'offline');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('guest', 'user', 'student', 'teacher', 'author', 'admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."coupon_type" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('pending_payment', 'paid', 'confirmed', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."enrollment_type" AS ENUM('online', 'offline');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('qris', 'virtual_account', 'credit_card', 'ewallet', 'bank_transfer');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'expired', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'late', 'excused');--> statement-breakpoint
CREATE TYPE "public"."class_status" AS ENUM('draft', 'active', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pending_review', 'butuh_keputusan', 'direncanakan', 'in_progress', 'review', 'done', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."merchant_registration_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."payment_gateway_mode" AS ENUM('sandbox', 'production');--> statement-breakpoint
CREATE TYPE "public"."notification_category" AS ENUM('task', 'order');--> statement-breakpoint
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
	"brochure_label" text,
	"primary_cta_label" text,
	"primary_cta_href" text,
	"primary_cta_icon" text,
	"secondary_cta_label" text,
	"secondary_cta_href" text,
	"secondary_cta_icon" text,
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
	"features" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
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
	"budget" integer,
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
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "account_provider_account_unique" UNIQUE("provider_id","account_id")
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
	"phone" text,
	"age" integer,
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
	"category_id" text,
	"status" text DEFAULT 'draft',
	"is_featured" boolean DEFAULT false NOT NULL,
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
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "post_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'approved' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
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
	"gateway_reference" text,
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
CREATE TABLE "site_header_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"site_name" text DEFAULT 'Inggris Go' NOT NULL,
	"meta_title" text DEFAULT 'Inggris Go — Belajar Bahasa Inggris Tanpa Takut Salah' NOT NULL,
	"meta_description" text DEFAULT 'Program speaking, English camp, dan kelas privat dari Kampung Inggris Pare. Mulai berbicara bahasa Inggris dengan percaya diri bersama Inggris Go.' NOT NULL,
	"meta_keywords" text DEFAULT 'belajar bahasa inggris, kampung inggris pare, english course, speaking english, english camp',
	"og_title" text DEFAULT 'Inggris Go — Belajar Bahasa Inggris Tanpa Takut Salah',
	"og_description" text DEFAULT 'Program speaking, English camp, dan kelas privat dari Kampung Inggris Pare.',
	"og_image_url" text,
	"favicon_url" text,
	"apple_touch_icon_url" text,
	"canonical_url" text,
	"theme_color" text DEFAULT '#1a52c8',
	"google_analytics_id" text,
	"google_tag_manager_id" text,
	"meta_pixel_id" text,
	"custom_head_script" text,
	"custom_body_end_script" text,
	"custom_body_start_html" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "footer_settings" (
	"id" text PRIMARY KEY DEFAULT 'singleton' NOT NULL,
	"tagline" text,
	"description" text,
	"instagram_url" text,
	"tiktok_url" text,
	"youtube_url" text,
	"facebook_url" text,
	"twitter_url" text,
	"linkedin_url" text,
	"whatsapp_number" text,
	"whatsapp_label" text,
	"email" text,
	"contact_page_href" text,
	"contact_page_label" text,
	"location_address" text,
	"location_maps_url" text,
	"stat_alumni_override" integer,
	"stat_program_override" integer,
	"stat_years_override" integer,
	"stat_rating_override" text,
	"cta_text" text,
	"cta_button_label" text,
	"cta_button_href" text,
	"privacy_href" text,
	"privacy_label" text,
	"terms_href" text,
	"terms_label" text,
	"location_tagline" text,
	"program_links" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" text PRIMARY KEY NOT NULL,
	"class_session_id" text NOT NULL,
	"class_enrollment_id" text NOT NULL,
	"status" "attendance_status" DEFAULT 'present' NOT NULL,
	"note" text,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attendance_records_session_enrollment_unique" UNIQUE("class_session_id","class_enrollment_id")
);
--> statement-breakpoint
CREATE TABLE "class_enrollments" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text NOT NULL,
	"enrollment_id" text NOT NULL,
	"student_name" text NOT NULL,
	"student_user_id" text,
	"is_removed" boolean DEFAULT false NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "class_enrollments_class_enrollment_unique" UNIQUE("class_id","enrollment_id")
);
--> statement-breakpoint
CREATE TABLE "class_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text NOT NULL,
	"session_date" timestamp NOT NULL,
	"label" text,
	"order" integer DEFAULT 0 NOT NULL,
	"google_drive_link" text,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" text PRIMARY KEY NOT NULL,
	"batch_id" text NOT NULL,
	"program_id" text NOT NULL,
	"teacher_id" text NOT NULL,
	"title" text NOT NULL,
	"period_label" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"status" "class_status" DEFAULT 'draft' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "student_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text NOT NULL,
	"class_enrollment_id" text NOT NULL,
	"grammar_accuracy" integer NOT NULL,
	"pronunciation" integer NOT NULL,
	"vocabulary" integer NOT NULL,
	"fluency" integer NOT NULL,
	"confidence" integer NOT NULL,
	"listening" integer NOT NULL,
	"participation" integer NOT NULL,
	"summary" text,
	"strengths" text,
	"areas_to_improve" text,
	"tutor_notes" text,
	"parent_recommendation" text,
	"tutor_coordinator_name" text,
	"finalized_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "student_scores_class_enrollment_id_unique" UNIQUE("class_enrollment_id")
);
--> statement-breakpoint
CREATE TABLE "task_attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"comment_id" text,
	"url" text NOT NULL,
	"uploaded_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_checklist_items" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"text" text NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"author_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'pending_review' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"created_by" text NOT NULL,
	"assignee_id" text,
	"verified_by" text,
	"verified_at" timestamp,
	"review_note" text,
	"start_date" timestamp,
	"due_date" timestamp,
	"cover_image_url" text,
	"position" integer DEFAULT 0 NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "merchant_registrations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"business_name" text NOT NULL,
	"owner_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"business_category" text,
	"description" text,
	"bank_name" text NOT NULL,
	"bank_account_number" text NOT NULL,
	"bank_account_name" text NOT NULL,
	"status" "merchant_registration_status" DEFAULT 'pending' NOT NULL,
	"review_note" text,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "merchant_registrations_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "payment_gateway_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"merchant_code" text,
	"api_key" text,
	"private_key" text,
	"mode" "payment_gateway_mode" DEFAULT 'sandbox' NOT NULL,
	"callback_url" text,
	"return_url" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_gateway_settings_provider_unique" UNIQUE("provider")
);
--> statement-breakpoint
CREATE TABLE "daily_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"report_date" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "daily_reports_user_date_unique" UNIQUE("user_id","report_date")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category" "notification_category" NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"link" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
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
ALTER TABLE "post" ADD CONSTRAINT "post_category_id_post_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."post_category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comment" ADD CONSTRAINT "post_comment_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comment" ADD CONSTRAINT "post_comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_class_session_id_class_sessions_id_fk" FOREIGN KEY ("class_session_id") REFERENCES "public"."class_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_class_enrollment_id_class_enrollments_id_fk" FOREIGN KEY ("class_enrollment_id") REFERENCES "public"."class_enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_student_user_id_user_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_batch_id_program_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."program_batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_user_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_scores" ADD CONSTRAINT "student_scores_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_scores" ADD CONSTRAINT "student_scores_class_enrollment_id_class_enrollments_id_fk" FOREIGN KEY ("class_enrollment_id") REFERENCES "public"."class_enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_comment_id_task_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."task_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_checklist_items" ADD CONSTRAINT "task_checklist_items_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_user_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_registrations" ADD CONSTRAINT "merchant_registrations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_registrations" ADD CONSTRAINT "merchant_registrations_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "attendance_records_session_id_idx" ON "attendance_records" USING btree ("class_session_id");--> statement-breakpoint
CREATE INDEX "attendance_records_enrollment_id_idx" ON "attendance_records" USING btree ("class_enrollment_id");--> statement-breakpoint
CREATE INDEX "class_enrollments_class_id_idx" ON "class_enrollments" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "class_enrollments_enrollment_id_idx" ON "class_enrollments" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "class_sessions_class_id_idx" ON "class_sessions" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "classes_batch_id_idx" ON "classes" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "classes_teacher_id_idx" ON "classes" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "student_scores_class_id_idx" ON "student_scores" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "task_attachments_task_id_idx" ON "task_attachments" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_attachments_comment_id_idx" ON "task_attachments" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "task_checklist_items_task_id_idx" ON "task_checklist_items" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_comments_task_id_idx" ON "task_comments" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tasks_created_by_idx" ON "tasks" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "tasks_assignee_id_idx" ON "tasks" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "merchant_registrations_status_idx" ON "merchant_registrations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "daily_reports_user_id_idx" ON "daily_reports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "daily_reports_report_date_idx" ON "daily_reports" USING btree ("report_date");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_read_idx" ON "notifications" USING btree ("user_id","is_read");