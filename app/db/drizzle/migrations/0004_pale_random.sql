CREATE TYPE "public"."project_status" AS ENUM('draft', 'active', 'completed', 'archived');--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"pic_id" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "project_id" text;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_pic_id_user_id_fk" FOREIGN KEY ("pic_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tasks_project_id_idx" ON "tasks" USING btree ("project_id");