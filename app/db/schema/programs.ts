// app/db/schema/programs.ts
// Updated version: added missing batch CTA/brochure fields and exports ProgramTheme from program.types.

import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

import {
  PROGRAM_BATCH_MODE,
  PROGRAM_BATCH_STATUS,
  PROGRAM_CATEGORY_STATUS,
  PROGRAM_FORMAT,
  PROGRAM_LEVEL,
  PROGRAM_SCHEDULE_TYPE,
  PROGRAM_STATUS,
} from "@/lib/enums/enums";
import type {
  BatchSchedule,
  Benefit,
  CategoryCTA,
  ComparisonItem,
  ExperienceItem,
  PainPoint,
  ProgramSection,
  ProgramTheme,
  SocialProof,
  Step,
} from "@/app/modules/program/program.types";

/* =========================================================
   ENUMS
========================================================= */

export const programCategoryStatusEnum = pgEnum(
  "program_category_status",
  PROGRAM_CATEGORY_STATUS,
);

export const programLevelEnum = pgEnum("program_level", PROGRAM_LEVEL);
export const programFormatEnum = pgEnum("program_format", PROGRAM_FORMAT);
export const programBatchModeEnum = pgEnum(
  "program_batch_mode",
  PROGRAM_BATCH_MODE,
);
export const programBatchStatusEnum = pgEnum(
  "program_batch_status",
  PROGRAM_BATCH_STATUS,
);
export const programStatusEnum = pgEnum("program_status", PROGRAM_STATUS);

export const REGISTRATION_TYPE = ["online", "offline"] as const;
export const registrationTypeEnum = pgEnum(
  "registration_type",
  REGISTRATION_TYPE,
);

export const programScheduleTypeEnum = pgEnum(
  "program_schedule_type",
  PROGRAM_SCHEDULE_TYPE,
);

/* =========================================================
   PROGRAMS
========================================================= */

export const programs = pgTable("programs", {
  id: text("id").primaryKey(),

  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),

  description: text("description").notNull(),
  shortDesc: text("short_desc"),

  scheduleType: programScheduleTypeEnum("schedule_type")
    .default("permanent")
    .notNull(),

  categoryId: text("category_id")
    .references(() => programCategories.id, { onDelete: "cascade" })
    .notNull(),

  status: programStatusEnum("status").default("draft").notNull(),
  registrationType: registrationTypeEnum("registration_type")
    .default("online")
    .notNull(),

  order: integer("order").default(0),

  startingPrice: integer("starting_price"),
  startingOriginalPrice: integer("starting_original_price"),

  // Internal budget allocation (IDR) for running this program — not shown
  // to customers, unrelated to the customer-facing prices above.
  budget: integer("budget"),

  badge: text("badge"),
  highlight: text("highlight"),
  tags: jsonb("tags").$type<string[]>(),

  icon: text("icon"),
  thumbnailUrl: text("thumbnail_url"),
  thumbnailKey: text("thumbnail_key"),
  thumbnailBlurDataUrl: text("thumbnail_blur_data_url"),

  duration: integer("duration"),
  level: programLevelEnum("level").default("beginner").notNull(),
  format: programFormatEnum("format").default("online").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* =========================================================
   PROGRAM BATCHES
========================================================= */

export const programBatches = pgTable("program_batches", {
  id: text("id").primaryKey(),

  programId: text("program_id")
    .references(() => programs.id, { onDelete: "cascade" })
    .notNull(),

  teacherId: text("teacher_id").references(() => user.id, {
    onDelete: "set null",
  }),

  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),

  status: programBatchStatusEnum("status").default("draft").notNull(),

  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  registrationDeadline: timestamp("registration_deadline"),

  capacity: integer("capacity"),
  enrolledCount: integer("enrolled_count").default(0).notNull(),

  mode: programBatchModeEnum("mode").default("online").notNull(),
  location: text("location"),
  schedules: jsonb("schedules").$type<BatchSchedule[]>(),
  timezone: text("timezone").default("WIB"),
  notes: text("notes"),

  // Public brochure shown on landing page / batch card.
  brochureUrl: text("brochure_url"),
  brochureLabel: text("brochure_label"),

  // Public CTA config for static/public components.
  primaryCtaLabel: text("primary_cta_label"),
  primaryCtaHref: text("primary_cta_href"),
  primaryCtaIcon: text("primary_cta_icon"),
  secondaryCtaLabel: text("secondary_cta_label"),
  secondaryCtaHref: text("secondary_cta_href"),
  secondaryCtaIcon: text("secondary_cta_icon"),

  order: integer("order").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* =========================================================
   PROGRAM PACKAGES
========================================================= */

export const programPackages = pgTable("program_packages", {
  id: text("id").primaryKey(),

  programId: text("program_id")
    .references(() => programs.id, { onDelete: "cascade" })
    .notNull(),

  batchId: text("batch_id").references(() => programBatches.id, {
    onDelete: "cascade",
  }),

  title: text("title").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),

  price: integer("price").notNull(),
  originalPrice: integer("original_price"),

  isDefault: boolean("is_default").default(false).notNull(),
  order: integer("order").default(0).notNull(),

  features: jsonb("features").$type<string[]>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* =========================================================
   PROGRAM CATEGORIES
========================================================= */

export const programCategories = pgTable("program_categories", {
  id: text("id").primaryKey(),

  slug: text("slug").notNull().unique(),
  label: text("label").notNull(),
  shortLabel: text("short_label"),

  order: integer("order").default(0).notNull(),
  status: programCategoryStatusEnum("status").default("draft").notNull(),

  icon: text("icon"),
  heroImage: text("hero_image"),

  tagline: text("tagline"),
  taglineAccent: text("tagline_accent"),
  description: text("description"),
  forWho: text("for_who"),
  themePrimary: text("theme_primary").notNull(),

  painPoints: jsonb("pain_points").$type<PainPoint[]>(),
  benefits: jsonb("benefits").$type<Benefit[]>(),
  steps: jsonb("steps").$type<Step[]>(),
  experience: jsonb("experience").$type<ExperienceItem[]>(),
  comparison: jsonb("comparison").$type<ComparisonItem[]>(),
  socialProof: jsonb("social_proof").$type<SocialProof[]>(),
  cta: jsonb("cta").$type<CategoryCTA>(),
  emptyState: jsonb("empty_state").$type<{
    title: string;
    description: string;
  }>(),

  quickDecisionLabel: text("quick_decision_label"),
  quickDecisionDesc: text("quick_decision_desc"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* =========================================================
   PROGRAM CONTENT
========================================================= */

export const programContent = pgTable("program_content", {
  id: text("id").primaryKey(),

  programId: text("program_id")
    .notNull()
    .unique()
    .references(() => programs.id, { onDelete: "cascade" }),

  theme: jsonb("theme").$type<ProgramTheme>(),
  isPublished: boolean("is_published").default(false).notNull(),

  // Each section has visible?: boolean.
  // Public renderer should filter with: section.visible !== false
  sections: jsonb("sections").$type<ProgramSection[]>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* =========================================================
   RELATIONS
========================================================= */

export const categoryRelations = relations(programCategories, ({ many }) => ({
  programs: many(programs),
}));

export const programContentRelations = relations(programContent, ({ one }) => ({
  program: one(programs, {
    fields: [programContent.programId],
    references: [programs.id],
  }),
}));

export const programBatchRelations = relations(
  programBatches,
  ({ one, many }) => ({
    program: one(programs, {
      fields: [programBatches.programId],
      references: [programs.id],
    }),
    packages: many(programPackages),
  }),
);

export const programRelations = relations(programs, ({ one, many }) => ({
  category: one(programCategories, {
    fields: [programs.categoryId],
    references: [programCategories.id],
  }),
  content: one(programContent),
  batches: many(programBatches),
  packages: many(programPackages),
}));

export const programPackageRelations = relations(
  programPackages,
  ({ one }) => ({
    program: one(programs, {
      fields: [programPackages.programId],
      references: [programs.id],
    }),
    batch: one(programBatches, {
      fields: [programPackages.batchId],
      references: [programBatches.id],
    }),
  }),
);
