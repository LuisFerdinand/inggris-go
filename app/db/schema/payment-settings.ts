// app/db/schema/payment-settings.ts

import { pgTable, text, timestamp, boolean, pgEnum, index, unique } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

/* =========================================================
   PAYMENT GATEWAY SETTINGS
   One row per provider (e.g. "tripay"). Managed exclusively
   by super_admin from /dashboard/settings/payment-gateway.
========================================================= */

export const paymentGatewayModeEnum = pgEnum("payment_gateway_mode", [
  "sandbox",
  "production",
]);

export const paymentGatewaySettings = pgTable("payment_gateway_settings", {
  id: text("id").primaryKey(),

  // e.g. "tripay". Free text so new gateways don't need a migration.
  provider: text("provider").notNull(),

  merchantCode: text("merchant_code"),

  // Encrypted at rest — see lib/crypto/secret-box.ts.
  apiKey: text("api_key"),
  privateKey: text("private_key"),

  mode: paymentGatewayModeEnum("mode").default("sandbox").notNull(),

  callbackUrl: text("callback_url"),
  returnUrl: text("return_url"),

  isActive: boolean("is_active").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({
  providerUnique: unique().on(table.provider),
}));

export type PaymentGatewaySettings = typeof paymentGatewaySettings.$inferSelect;
export type NewPaymentGatewaySettings = typeof paymentGatewaySettings.$inferInsert;

/* =========================================================
   MERCHANT REGISTRATIONS
   Submitted by a regular user from /dashboard/merchant,
   reviewed/approved by super_admin. One row per user.
========================================================= */

export const merchantRegistrationStatusEnum = pgEnum(
  "merchant_registration_status",
  ["pending", "approved", "rejected"],
);

export const merchantRegistrations = pgTable("merchant_registrations", {
  id: text("id").primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  businessName: text("business_name").notNull(),
  ownerName: text("owner_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),

  businessCategory: text("business_category"),
  description: text("description"),

  bankName: text("bank_name").notNull(),
  bankAccountNumber: text("bank_account_number").notNull(),
  bankAccountName: text("bank_account_name").notNull(),

  status: merchantRegistrationStatusEnum("status").default("pending").notNull(),

  reviewNote: text("review_note"),
  reviewedBy: text("reviewed_by").references(() => user.id),
  reviewedAt: timestamp("reviewed_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({
  userUnique: unique().on(table.userId),
  statusIdx: index("merchant_registrations_status_idx").on(table.status),
}));

export type MerchantRegistration = typeof merchantRegistrations.$inferSelect;
export type NewMerchantRegistration = typeof merchantRegistrations.$inferInsert;
