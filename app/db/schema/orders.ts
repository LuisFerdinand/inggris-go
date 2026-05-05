import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  jsonb,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { programBatches, programs } from "./programs";
import { user } from "./auth-schema";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "cancelled",
]);

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),

    programId: text("program_id")
      .notNull()
      .references(() => programs.id),
    batchId: text("batch_id").references(() => programBatches.id),
    userId: text("user_id").references(() => user.id),
    programSnapshot: jsonb("program_snapshot").notNull(),

    // Common fields (for quick access & admin)
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),

    // Promoted fields (optional but powerful)
    childName: text("child_name"),
    age: integer("age"),

    // Flexible data for each program
    data: jsonb("data").notNull(),

    source: text("source").default("web"),

    status: orderStatusEnum("status").default("pending").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    programIdx: index("orders_program_id_idx").on(table.programId),
  }),
);
