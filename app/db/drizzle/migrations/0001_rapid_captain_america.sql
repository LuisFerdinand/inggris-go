CREATE TYPE "public"."score_status" AS ENUM('draft', 'pending_review', 'approved', 'rejected');--> statement-breakpoint
ALTER TYPE "public"."notification_category" ADD VALUE 'class';--> statement-breakpoint
ALTER TABLE "student_scores" ADD COLUMN "status" "score_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "student_scores" ADD COLUMN "submitted_at" timestamp;--> statement-breakpoint
ALTER TABLE "student_scores" ADD COLUMN "reviewed_by" text;--> statement-breakpoint
ALTER TABLE "student_scores" ADD COLUMN "reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "student_scores" ADD COLUMN "review_note" text;--> statement-breakpoint
ALTER TABLE "student_scores" ADD CONSTRAINT "student_scores_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;