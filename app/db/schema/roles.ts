// app/db/schema/roles.ts
import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  index,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const ROLES = [
  "guest",
  "user",
  "student",
  "teacher",
  "author",
  "admin",
  "super_admin",
] as const;

export type Role = (typeof ROLES)[number];

export const userRoleEnum = pgEnum("role", ROLES);

export const role = pgTable("roles", {
  id: text("id").primaryKey(),

  name: userRoleEnum("name").notNull().unique(),

  description: text("description"),
});

export const userRole = pgTable(
  "user_role",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    roleId: text("role_id")
      .notNull()
      .references(() => role.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("user_role_user_idx").on(table.userId),

    index("user_role_role_idx").on(table.roleId),

    unique().on(table.userId, table.roleId),
  ],
);

export const roleRelations = relations(role, ({ many }) => ({
  users: many(userRole),
}));

export const userRoleRelations = relations(userRole, ({ one }) => ({
  user: one(user, {
    fields: [userRole.userId],
    references: [user.id],
  }),

  role: one(role, {
    fields: [userRole.roleId],
    references: [role.id],
  }),
}));