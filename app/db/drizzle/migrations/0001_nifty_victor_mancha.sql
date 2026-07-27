CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'late', 'excused');--> statement-breakpoint
CREATE TYPE "public"."class_status" AS ENUM('draft', 'active', 'completed', 'archived');--> statement-breakpoint
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
ALTER TABLE "post" ADD COLUMN "category_id" text;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "post_category" ADD COLUMN "order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "post_comment" ADD CONSTRAINT "post_comment_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comment" ADD CONSTRAINT "post_comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
CREATE INDEX "attendance_records_session_id_idx" ON "attendance_records" USING btree ("class_session_id");--> statement-breakpoint
CREATE INDEX "attendance_records_enrollment_id_idx" ON "attendance_records" USING btree ("class_enrollment_id");--> statement-breakpoint
CREATE INDEX "class_enrollments_class_id_idx" ON "class_enrollments" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "class_enrollments_enrollment_id_idx" ON "class_enrollments" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "class_sessions_class_id_idx" ON "class_sessions" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "classes_batch_id_idx" ON "classes" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "classes_teacher_id_idx" ON "classes" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "student_scores_class_id_idx" ON "student_scores" USING btree ("class_id");--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_category_id_post_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."post_category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_provider_account_unique" UNIQUE("provider_id","account_id");