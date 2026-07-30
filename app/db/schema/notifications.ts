// app/db/schema/notifications.ts
// Per-user notification feed. `category` drives the icon/color family in the
// UI (task vs order); `type` is the specific event within that category.

import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const notificationCategoryEnum = pgEnum("notification_category", [
  "task",
  "order",
]);

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),

    category: notificationCategoryEnum("category").notNull(),
    // Specific event within the category, e.g. "task_assigned",
    // "task_verified", "task_rejected", "order_new", "order_paid".
    type: text("type").notNull(),

    title: text("title").notNull(),
    body: text("body"),
    link: text("link"),

    isRead: boolean("is_read").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("notifications_user_id_idx").on(table.userId),
    userReadIdx: index("notifications_user_read_idx").on(
      table.userId,
      table.isRead,
    ),
  }),
);

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
}));
