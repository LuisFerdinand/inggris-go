// app/db/schema/projects.ts
// Projects wrap the team task board: admin/super_admin/operational_manager
// create a project, every task belongs to exactly one, and the project
// carries its own draft -> active -> completed/archived lifecycle.

import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

import { PROJECT_STATUS } from "@/lib/enums/enums";

export const projectStatusEnum = pgEnum("project_status", PROJECT_STATUS);

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),
  description: text("description"),

  status: projectStatusEnum("status").default("draft").notNull(),

  // Project lead / penanggung jawab — optional, distinct from each task's
  // own PIC (tasks.assigneeId).
  picId: text("pic_id").references(() => user.id, { onDelete: "set null" }),

  createdBy: text("created_by")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

// Note: no reverse `tasks: many(tasks)` relation here — that would create a
// circular import with tasks.ts (which references `projects` for its FK).
// A project's tasks are queried directly with `eq(tasks.projectId, id)`.
export const projectRelations = relations(projects, ({ one }) => ({
  pic: one(user, {
    fields: [projects.picId],
    references: [user.id],
    relationName: "projectPic",
  }),
  creator: one(user, {
    fields: [projects.createdBy],
    references: [user.id],
    relationName: "projectCreator",
  }),
}));
