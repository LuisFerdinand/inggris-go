// app/db/schema/daily-reports.ts
// Free-text daily report every task-board member submits once per day —
// a lightweight standup log, not tied to any specific task.

import {
  index,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const dailyReports = pgTable(
  "daily_reports",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),

    // Stored as YYYY-MM-DD (caller's local date), one report per user per day.
    reportDate: text("report_date").notNull(),

    content: text("content").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    userDateUnique: unique("daily_reports_user_date_unique").on(
      table.userId,
      table.reportDate,
    ),
    userIdx: index("daily_reports_user_id_idx").on(table.userId),
    dateIdx: index("daily_reports_report_date_idx").on(table.reportDate),
  }),
);
