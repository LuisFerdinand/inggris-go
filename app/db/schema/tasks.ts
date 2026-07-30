// app/db/schema/tasks.ts
// Team Task Board: a Trello/Jira-style kanban shared by every non-student
// role. Anyone on the board can create a task, but a super_admin must
// verify (approve/reject) it before it can move past "todo". Verified
// tasks are then dragged across todo -> in_progress -> done.

import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

import { TASK_PRIORITY, TASK_STATUS } from "@/lib/enums/enums";

/* =========================================================
   ENUMS
========================================================= */

export const taskStatusEnum = pgEnum("task_status", TASK_STATUS);
export const taskPriorityEnum = pgEnum("task_priority", TASK_PRIORITY);

/* =========================================================
   TASKS
========================================================= */

export const tasks = pgTable(
  "tasks",
  {
    id: text("id").primaryKey(),

    title: text("title").notNull(),
    description: text("description"),

    status: taskStatusEnum("status").default("pending_review").notNull(),
    priority: taskPriorityEnum("priority").default("medium").notNull(),

    createdBy: text("created_by")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),

    assigneeId: text("assignee_id").references(() => user.id, {
      onDelete: "set null",
    }),

    // Verification (super_admin only).
    verifiedBy: text("verified_by").references(() => user.id, {
      onDelete: "set null",
    }),
    verifiedAt: timestamp("verified_at"),
    reviewNote: text("review_note"),

    // Timeline.
    startDate: timestamp("start_date"),
    dueDate: timestamp("due_date"),

    coverImageUrl: text("cover_image_url"),

    // Ordering within a kanban column, for drag-and-drop reordering.
    position: integer("position").default(0).notNull(),

    // Manually-tracked completion percentage (0-100), independent of status.
    progress: integer("progress").default(0).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    statusIdx: index("tasks_status_idx").on(table.status),
    createdByIdx: index("tasks_created_by_idx").on(table.createdBy),
    assigneeIdx: index("tasks_assignee_id_idx").on(table.assigneeId),
  }),
);

/* =========================================================
   TASK COMMENTS
========================================================= */

export const taskComments = pgTable(
  "task_comments",
  {
    id: text("id").primaryKey(),

    taskId: text("task_id")
      .references(() => tasks.id, { onDelete: "cascade" })
      .notNull(),

    authorId: text("author_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),

    body: text("body").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    taskIdx: index("task_comments_task_id_idx").on(table.taskId),
  }),
);

/* =========================================================
   TASK CHECKLIST ITEMS (sub-tasks)
========================================================= */

export const taskChecklistItems = pgTable(
  "task_checklist_items",
  {
    id: text("id").primaryKey(),

    taskId: text("task_id")
      .references(() => tasks.id, { onDelete: "cascade" })
      .notNull(),

    text: text("text").notNull(),
    done: boolean("done").default(false).notNull(),

    position: integer("position").default(0).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    taskIdx: index("task_checklist_items_task_id_idx").on(table.taskId),
  }),
);

/* =========================================================
   TASK ATTACHMENTS (Cloudinary images)
========================================================= */

export const taskAttachments = pgTable(
  "task_attachments",
  {
    id: text("id").primaryKey(),

    taskId: text("task_id")
      .references(() => tasks.id, { onDelete: "cascade" })
      .notNull(),

    // Set when the image was uploaded alongside a specific comment;
    // null means it's a task-level gallery image.
    commentId: text("comment_id").references(() => taskComments.id, {
      onDelete: "cascade",
    }),

    url: text("url").notNull(),

    uploadedBy: text("uploaded_by").references(() => user.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    taskIdx: index("task_attachments_task_id_idx").on(table.taskId),
    commentIdx: index("task_attachments_comment_id_idx").on(table.commentId),
  }),
);

/* =========================================================
   RELATIONS
========================================================= */

export const taskRelations = relations(tasks, ({ one, many }) => ({
  creator: one(user, {
    fields: [tasks.createdBy],
    references: [user.id],
    relationName: "taskCreator",
  }),
  assignee: one(user, {
    fields: [tasks.assigneeId],
    references: [user.id],
    relationName: "taskAssignee",
  }),
  verifier: one(user, {
    fields: [tasks.verifiedBy],
    references: [user.id],
    relationName: "taskVerifier",
  }),
  comments: many(taskComments),
  attachments: many(taskAttachments),
  checklistItems: many(taskChecklistItems),
}));

export const taskChecklistItemRelations = relations(
  taskChecklistItems,
  ({ one }) => ({
    task: one(tasks, {
      fields: [taskChecklistItems.taskId],
      references: [tasks.id],
    }),
  }),
);

export const taskCommentRelations = relations(
  taskComments,
  ({ one, many }) => ({
    task: one(tasks, {
      fields: [taskComments.taskId],
      references: [tasks.id],
    }),
    author: one(user, {
      fields: [taskComments.authorId],
      references: [user.id],
    }),
    attachments: many(taskAttachments),
  }),
);

export const taskAttachmentRelations = relations(
  taskAttachments,
  ({ one }) => ({
    task: one(tasks, {
      fields: [taskAttachments.taskId],
      references: [tasks.id],
    }),
    comment: one(taskComments, {
      fields: [taskAttachments.commentId],
      references: [taskComments.id],
    }),
    uploader: one(user, {
      fields: [taskAttachments.uploadedBy],
      references: [user.id],
    }),
  }),
);
