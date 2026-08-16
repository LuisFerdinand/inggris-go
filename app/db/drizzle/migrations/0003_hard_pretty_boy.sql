ALTER TYPE "public"."task_status" ADD VALUE 'needs_fixing' BEFORE 'done';--> statement-breakpoint
ALTER TYPE "public"."task_status" ADD VALUE 'pending_director_approval' BEFORE 'done';