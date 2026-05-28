import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
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
import {
  BatchSchedule,
  Benefit,
  CategoryCTA,
  ComparisonItem,
  ExperienceItem,
  PainPoint,
  ProgramSection,
  SocialProof,
  Step,
} from "@/app/modules/program/program.types";

/* =========================================================
   ENUMS
========================================================= */

// Status for program categories shown in public catalog
export const programCategoryStatusEnum = pgEnum(
  "program_category_status",
  PROGRAM_CATEGORY_STATUS,
);

// Difficulty level of a program
export const programLevelEnum = pgEnum("program_level", PROGRAM_LEVEL);

// Delivery format of a program
// Example: online, offline, hybrid
export const programFormatEnum = pgEnum("program_format", PROGRAM_FORMAT);

// Actual batch implementation mode
// Usually mirrors program format
export const programBatchModeEnum = pgEnum(
  "program_batch_mode",
  PROGRAM_BATCH_MODE,
);

// Lifecycle status of a batch
// Example: draft, open, ongoing, completed
export const programBatchStatusEnum = pgEnum(
  "program_batch_status",
  PROGRAM_BATCH_STATUS,
);

// Lifecycle status of a program
// Example: draft, published, archived
export const programStatusEnum = pgEnum("program_status", PROGRAM_STATUS);

// Registration flow
// online  = user registers through website
// offline = manual/admin registration
export const REGISTRATION_TYPE = ["online", "offline"] as const;
export const registrationTypeEnum = pgEnum(
  "registration_type",
  REGISTRATION_TYPE,
);

// IMPORTANT CORE ARCHITECTURE
//
// permanent:
//   Program has direct packages
//   No batches needed
//
// scheduled:
//   Program contains batches
//   Each batch contains packages
//
// This determines the overall structure
// of the program enrollment flow.
export const programScheduleTypeEnum = pgEnum(
  "program_schedule_type",
  PROGRAM_SCHEDULE_TYPE,
);

/* =========================================================
   PROGRAMS
========================================================= */

export const programs = pgTable("programs", {
  id: text("id").primaryKey(),

  // Main program identity
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),

  // Public descriptions
  description: text("description").notNull(),
  shortDesc: text("short_desc"),

  // Determines whether program uses:
  // - direct packages
  // - batches + packages
  scheduleType: programScheduleTypeEnum("schedule_type")
    .default("permanent")
    .notNull(),

  // Program category
  categoryId: text("category_id")
    .references(() => programCategories.id, {
      onDelete: "cascade",
    })
    .notNull(),

  // Program lifecycle state
  status: programStatusEnum("status").default("draft").notNull(),

  // Registration mechanism
  registrationType: registrationTypeEnum("registration_type")
    .default("online")
    .notNull(),

  // Ordering in listings
  order: integer("order").default(0),

  /* -----------------------------------------
     Display-only pricing
     Used for cards/landing pages.
     Actual purchasable prices live in packages.
  ----------------------------------------- */
  startingPrice: integer("starting_price"),
  startingOriginalPrice: integer("starting_original_price"),

  // Marketing labels
  badge: text("badge"),
  highlight: text("highlight"),

  // Search/filter tags
  tags: jsonb("tags").$type<string[]>(),

  // Visual assets
  icon: text("icon"),
  thumbnailUrl: text("thumbnail_url"),
  thumbnailKey: text("thumbnail_key"),
  thumbnailBlurDataUrl: text("thumbnail_blur_data_url"),

  // Estimated duration
  // Example: hours/days depending on app logic
  duration: integer("duration"),

  // Program difficulty
  level: programLevelEnum("level").default("beginner").notNull(),

  // Delivery method
  format: programFormatEnum("format").default("online").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),

  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* =========================================================
   PROGRAM BATCHES
========================================================= */

// ONLY used when:
// program.scheduleType === "scheduled"
//
// Example:
// - Batch January 2026
// - Weekend Class
// - Morning Cohort

export const programBatches = pgTable("program_batches", {
  id: text("id").primaryKey(),

  // Parent program
  programId: text("program_id")
    .references(() => programs.id, {
      onDelete: "cascade",
    })
    .notNull(),

  // Optional instructor, if no teacher then use system
  teacherId: text("teacher_id").references(() => user.id, {
    onDelete: "set null",
  }),

  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),

  // Batch lifecycle
  status: programBatchStatusEnum("status").default("draft").notNull(),

  // Batch schedule
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  registrationDeadline: timestamp("registration_deadline"),

  // Enrollment limits
  capacity: integer("capacity"),

  // Cached enrolled students count
  enrolledCount: integer("enrolled_count").default(0).notNull(),

  // online / offline / hybrid
  mode: programBatchModeEnum("mode").default("online").notNull(),

  // Physical location if offline
  location: text("location"),

  schedules: jsonb("schedules").$type<BatchSchedule[]>(),
  timezone: text("timezone").default("WIB"),
  notes: text("notes"),
  brochureUrl: text("brochure_url"),
  primaryCtaLabel: text("primary_cta_label"),

  primaryCtaHref: text("primary_cta_href"),

  secondaryCtaLabel: text("secondary_cta_label"),

  secondaryCtaHref: text("secondary_cta_href"),

  order: integer("order").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* =========================================================
   PROGRAM PACKAGES
========================================================= */

// Purchasable enrollment/package option
//
// Examples:
// - Regular Class
// - VIP Mentoring
// - Certification Package
//
// Structure:
//
// permanent program:
//   package belongs directly to program
//   batchId = null
//
// scheduled program:
//   package belongs to batch
//   batchId required

export const programPackages = pgTable("program_packages", {
  id: text("id").primaryKey(),

  // Parent program
  programId: text("program_id")
    .references(() => programs.id, {
      onDelete: "cascade",
    })
    .notNull(),

  // Optional batch
  // Required only for scheduled programs
  batchId: text("batch_id").references(() => programBatches.id, {
    onDelete: "cascade",
  }),

  title: text("title").notNull(),

  slug: text("slug").notNull(),

  description: text("description"),

  // Actual selling price
  price: integer("price").notNull(),

  // Original/crossed-out price
  originalPrice: integer("original_price"),

  // Default highlighted package
  isDefault: boolean("is_default").default(false).notNull(),

  // Display order
  order: integer("order").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  features: jsonb("features").$type<string[]>(),
});

/* =========================================================
   PROGRAM CATEGORIES
========================================================= */

// CMS-driven category landing pages
//
// Example:
// - UI/UX Design
// - Data Science
// - English Course

export const programCategories = pgTable("program_categories", {
  id: text("id").primaryKey(),

  slug: text("slug").notNull().unique(),

  label: text("label").notNull(),

  shortLabel: text("short_label"),

  order: integer("order").default(0).notNull(),

  status: programCategoryStatusEnum("status").default("draft").notNull(),

  // Visual identity
  icon: text("icon"),
  heroImage: text("hero_image"),

  // Marketing copy
  tagline: text("tagline"),
  taglineAccent: text("tagline_accent"),

  description: text("description"),

  forWho: text("for_who"),

  // Main category branding color
  themePrimary: text("theme_primary").notNull(),

  /* -----------------------------------------
     Flexible CMS sections
  ----------------------------------------- */

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

// Dynamic modular content builder
//
// Stores landing page/course structure
// as flexible JSON sections.
//
// One-to-one relationship with program.

export type ProgramTheme = {
  primary?: string;
  accent?: string;
  background?: string;

  foreground?: string;

  gradient?: {
    from: string;
    to: string;
  };
};

export const programContent = pgTable("program_content", {
  id: text("id").primaryKey(),

  // One content document per program
  programId: text("program_id")
    .notNull()
    .unique()
    .references(() => programs.id, {
      onDelete: "cascade",
    }),
  theme: jsonb("theme").$type<ProgramTheme>(),
  isPublished: boolean("is_published").default(false).notNull(),

  // Main flexible content builder
  sections: jsonb("sections").$type<ProgramSection[]>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

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
