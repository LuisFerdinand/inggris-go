import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const roleEnum = pgEnum("role_enum", [
  "guest",
  "user",
  "teacher",
  "author",
  "admin",
  "super_admin",
]);

export const role = pgTable("role", {
  id: text("id").primaryKey(),
  name: roleEnum("name").notNull().unique(),
  description: text("description"),
});

export const userRole = pgTable(
  "user_role",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    roleId: text("role_id")
      .notNull()
      .references(() => role.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("user_role_user_idx").on(table.userId),
    index("user_role_role_idx").on(table.roleId),
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
