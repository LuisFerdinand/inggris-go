import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  jsonb,
  integer,
  index,
  boolean,
} from "drizzle-orm/pg-core";

import {
  programs,
  programBatches,
  programPackages,
  programScheduleTypeEnum,
} from "./programs";

import { user } from "./auth-schema";

/* =========================================================
   ENUMS
========================================================= */

// Enrollment/payment lifecycle
export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "pending_payment",
  "paid",
  "confirmed",
  "cancelled",
  "expired",
]);

// Registration source flow
//
// online:
//   submitted from website/public form
//
// offline:
//   manually handled/admin-assisted registration
export const enrollmentTypeEnum = pgEnum("enrollment_type", [
  "online",
  "offline",
]);

/* =========================================================
   ORDER / ENROLLMENT DATA TYPES
========================================================= */

// ---------------------------------------------------------
// ONLINE REGISTRATION
// ---------------------------------------------------------

export type OnlineEnrollmentData = {
  type: "online";

  /* -----------------------------------------
     Selected Program Structure
  ----------------------------------------- */

  programId: string;

  // Required only for scheduled programs
  batchId?: string;

  packageId: string;

  /* -----------------------------------------
     Participant
  ----------------------------------------- */

  fullName: string;

  whatsapp: string;

  email?: string;

  age?: number;
};

// ---------------------------------------------------------
// OFFLINE REGISTRATION
// Example:
// - Kids class
// - School program
// - Camp registration
// ---------------------------------------------------------

export type OfflineEnrollmentData = {
  type: "offline";

  /* -----------------------------------------
     Selected Program Structure
  ----------------------------------------- */

  programId: string;

  batchId: string;

  packageId: string;

  batchLabel: string;

  packageLabel: string;

  /* -----------------------------------------
     Child Information
  ----------------------------------------- */

  nama: string;

  panggilan: string;

  jenisKelamin: "L" | "P";

  tempatLahir: string;

  tanggalLahir: string;

  usia: number;

  kelas: string;

  sekolah: string;

  kotaAsal: string;

  /* -----------------------------------------
     Parent Information
  ----------------------------------------- */

  namaOrtu: string;

  hpOrtu: string;

  hpAnak?: string;

  email?: string;

  /* -----------------------------------------
     Additional Information
  ----------------------------------------- */

  alumni: "yes" | "no";

  sumberInfo: string;

  alergi: "yes" | "no";

  detailAlergi?: string;

  catatan?: string;

  harapan: string;

  /* -----------------------------------------
     Extra Attributes
  ----------------------------------------- */

  ukuranKaos: string;
};

export type EnrollmentData = OnlineEnrollmentData | OfflineEnrollmentData;

/* =========================================================
   ENROLLMENTS
========================================================= */

// IMPORTANT:
//
// This table represents:
// - program registration
// - enrollment
// - purchase record
//
// Purchasable entity:
// program_packages
//
// Structure:
//
// permanent:
//   Program -> Package -> Enrollment
//
// scheduled:
//   Program -> Batch -> Package -> Enrollment

export const enrollments = pgTable(
  "enrollments",
  {
    id: text("id").primaryKey(),

    /* =====================================================
       RELATIONAL REFERENCES
    ===================================================== */

    // Main program
    programId: text("program_id")
      .notNull()
      .references(() => programs.id),

    // Optional batch
    // Required for scheduled programs
    batchId: text("batch_id").references(() => programBatches.id),

    // Actual purchased package
    packageId: text("package_id")
      .notNull()
      .references(() => programPackages.id),

    // Optional authenticated user
    userId: text("user_id").references(() => user.id),

    /* =====================================================
       PROGRAM STRUCTURE SNAPSHOT
    ===================================================== */

    // Snapshot of program structure at purchase time
    //
    // VERY IMPORTANT because:
    // - program/package titles can change
    // - prices can change
    // - categories can change
    //
    // Historical enrollments must remain immutable.

    scheduleType: programScheduleTypeEnum("schedule_type").notNull(),

    /* =====================================================
       ENTITY SNAPSHOTS
    ===================================================== */

    programSnapshot: jsonb("program_snapshot").$type<{
      id: string;

      title: string;

      slug: string;

      categorySlug?: string;

      format?: string;

      level?: string;

      thumbnail?: string;
    }>(),

    batchSnapshot: jsonb("batch_snapshot").$type<{
      id: string;

      title: string;

      slug?: string;

      startDate?: string;

      endDate?: string;

      mode?: string;

      location?: string;
    }>(),

    packageSnapshot: jsonb("package_snapshot").$type<{
      id: string;

      title: string;

      slug?: string;

      description?: string;

      price: number;

      originalPrice?: number | null;

      isDefault?: boolean;
    }>(),

    /* =====================================================
       REGISTRATION FLOW
    ===================================================== */

    type: enrollmentTypeEnum("type").notNull(),

    /* =====================================================
       QUICK ACCESS FIELDS
    ===================================================== */

    // Promoted fields for:
    // - admin tables
    // - exports
    // - search
    // - analytics
    //
    // Avoid expensive JSON parsing.

    customerName: text("customer_name").notNull(),

    phone: text("phone").notNull(),

    email: text("email"),

    childName: text("child_name"),

    age: integer("age"),

    /* =====================================================
       FULL FORM DATA
    ===================================================== */

    // Original submitted registration form
    //
    // Flexible and future-proof.
    data: jsonb("data").$type<EnrollmentData>().notNull(),

    /* =====================================================
       FILE ATTACHMENTS
    ===================================================== */

    attachments: jsonb("attachments").$type<{
      foto?: string;
    }>(),

    /* =====================================================
       TRACKING / ANALYTICS
    ===================================================== */

    metadata: jsonb("metadata").$type<{
      ip?: string;

      userAgent?: string;

      referer?: string;
    }>(),

    source: text("source").default("web"),

    /* =====================================================
       ADMIN FLAGS
    ===================================================== */

    // Useful for:
    // - imported data
    // - admin-created enrollment
    // - scholarship
    // - special handling
    isManual: boolean("is_manual").default(false).notNull(),

    /* =====================================================
       STATUS
    ===================================================== */

    status: enrollmentStatusEnum("status").default("pending_payment").notNull(),

    couponCode: text("coupon_code"),

    couponSnapshot: jsonb("coupon_snapshot").$type<{
      id: string;
      code?: string;
      name: string;
      type: string;

      discountType: string;
      discountValue: number;
    }>(),

    discountAmount: integer("discount_amount").default(0).notNull(),

    subtotalPrice: integer("subtotal_price").notNull(),

    finalPrice: integer("final_price").notNull(),

    /* =====================================================
       TIMESTAMPS
    ===================================================== */

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },

  (table) => ({
    // Main queries
    programIdx: index("enrollments_program_id_idx").on(table.programId),

    batchIdx: index("enrollments_batch_id_idx").on(table.batchId),

    packageIdx: index("enrollments_package_id_idx").on(table.packageId),

    statusIdx: index("enrollments_status_idx").on(table.status),

    createdAtIdx: index("enrollments_created_at_idx").on(table.createdAt),
  }),
);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "expired",
  "cancelled",
  "refunded",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "qris",
  "virtual_account",
  "credit_card",
  "ewallet",
  "bank_transfer",
]);
export const payments = pgTable(
  "payments",
  {
    id: text("id").primaryKey(),

    /* =========================================
       RELATION
    ========================================= */

    enrollmentId: text("enrollment_id")
      .notNull()
      .references(() => enrollments.id),

    /* =========================================
       GATEWAY
    ========================================= */

    provider: text("provider").default("doku").notNull(),

    paymentMethod: paymentMethodEnum("payment_method"),

    /* =========================================
       DOKU REFERENCES
    ========================================= */

    // Your generated invoice/order number
    invoiceNumber: text("invoice_number").notNull(),

    // DOKU invoice/payment reference
    dokuInvoiceId: text("doku_invoice_id"),

    // Session/payment URL
    paymentUrl: text("payment_url"),

    /* =========================================
       FINANCIAL SNAPSHOT
    ========================================= */

    amount: integer("amount").notNull(),

    currency: text("currency").default("IDR").notNull(),

    /* =========================================
       PAYMENT STATUS
    ========================================= */

    status: paymentStatusEnum("status").default("pending").notNull(),

    paidAt: timestamp("paid_at"),

    expiredAt: timestamp("expired_at"),

    /* =========================================
       RAW GATEWAY DATA
    ========================================= */

    // Full request payload sent to DOKU
    requestPayload: jsonb("request_payload"),

    // Full response from DOKU
    responsePayload: jsonb("response_payload"),

    // Latest webhook payload
    callbackPayload: jsonb("callback_payload"),

    /* =========================================
       FAILURE DEBUGGING
    ========================================= */

    failureReason: text("failure_reason"),

    /* =========================================
       TIMESTAMPS
    ========================================= */

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },

  (table) => ({
    enrollmentIdx: index("payments_enrollment_idx").on(table.enrollmentId),

    invoiceIdx: index("payments_invoice_idx").on(table.invoiceNumber),

    dokuInvoiceIdx: index("payments_doku_invoice_idx").on(table.dokuInvoiceId),

    statusIdx: index("payments_status_idx").on(table.status),
  }),
);

export const paymentWebhooks = pgTable("payment_webhooks", {
  id: text("id").primaryKey(),

  provider: text("provider").default("doku").notNull(),

  eventType: text("event_type"),

  signature: text("signature"),

  payload: jsonb("payload").notNull(),

  isVerified: boolean("is_verified").default(false).notNull(),

  processed: boolean("processed").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const couponTypeEnum = pgEnum("coupon_type", ["public", "private"]);
export const discountTypeEnum = pgEnum("discount_type", [
  "percentage",
  "fixed",
]);

export const coupons = pgTable("coupons", {
  id: text("id").primaryKey(),

  /* =========================================
       BASIC
    ========================================= */

  code: text("code"),

  name: text("name").notNull(),

  description: text("description"),

  type: couponTypeEnum("type").notNull(),

  /* =========================================
       DISCOUNT
    ========================================= */

  discountType: discountTypeEnum("discount_type").notNull(),

  discountValue: integer("discount_value").notNull(),

  maxDiscount: integer("max_discount"),

  minimumPurchase: integer("minimum_purchase"),

  /* =========================================
       VALIDITY
    ========================================= */

  startsAt: timestamp("starts_at"),

  expiresAt: timestamp("expires_at"),

  isActive: boolean("is_active").default(true).notNull(),

  /* =========================================
       USAGE LIMITS
    ========================================= */

  maxTotalUsage: integer("max_total_usage"),

  maxUsagePerUser: integer("max_usage_per_user"),

  usedCount: integer("used_count").default(0).notNull(),

  /* =========================================
       OWNERSHIP
    ========================================= */

  // Optional:
  // only this user can use it
  assignedUserId: text("assigned_user_id").references(() => user.id),

  /* =========================================
       TARGETING RULES
    ========================================= */

  rules: jsonb("rules").$type<{
    allowedProgramIds?: string[];

    allowedPackageIds?: string[];

    allowedCategories?: string[];

    onlyForAlumni?: boolean;

    minimumAge?: number;

    maximumAge?: number;
  }>(),

  /* =========================================
       TIMESTAMPS
    ========================================= */

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const couponUsages = pgTable("coupon_usages", {
  id: text("id").primaryKey(),

  couponId: text("coupon_id")
    .notNull()
    .references(() => coupons.id),

  enrollmentId: text("enrollment_id")
    .notNull()
    .references(() => enrollments.id),

  userId: text("user_id").references(() => user.id),

  discountAmount: integer("discount_amount").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
