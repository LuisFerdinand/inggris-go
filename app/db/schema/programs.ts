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
  PainPoint,
  Benefit,
  CategoryCTA,
  ComparisonItem,
  ExperienceItem,
  HeroCTA,
  SocialProof,
  Step,
  Tag,
  ProgramSection,
  ProgramBatch,
  PriceTier,
} from "@/app/modules/program/program.types";
import {
  MaterialType,
  PROGRAM_BATCH_STATUS,
  PROGRAM_CATEGORY_STATUS,
  PROGRAM_FORMAT,
  PROGRAM_LEVEL,
  PROGRAM_STATUS,
} from "@/lib/enums";

export const programCategoryStatusEnum = pgEnum(
  "program_category_status",
  PROGRAM_CATEGORY_STATUS,
);
export const programLevelEnum = pgEnum("program_level", PROGRAM_LEVEL);
export const programFormatEnum = pgEnum("program_format", PROGRAM_FORMAT);
export const programBatchModeEnum = pgEnum(
  "program_batch_enum",
  PROGRAM_FORMAT,
);
export const programBatchStatusEnum = pgEnum(
  "program_batch_status",
  PROGRAM_BATCH_STATUS,
);

export const programStatusEnum = pgEnum("program_status", PROGRAM_STATUS);

export const registrationTypeEnum = pgEnum("registration_type", [
  "online",
  "offline",
]);
export const programBatchTypeEnum = pgEnum("program_batch_type", [
  "scheduled",
  "package",
]);
export const programs = pgTable("programs", {
  id: text("id").primaryKey(),

  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),

  description: text("description").notNull(),
  shortDesc: text("short_desc"),

  categoryId: text("category_id")
    .notNull()
    .references(() => programCategories.id, { onDelete: "cascade" }),

  status: programStatusEnum("status").default("draft").notNull(),
  registrationType: registrationTypeEnum("registration_type")
    .default("online")
    .notNull(),

  order: integer("order").default(0),

  startingPrice: integer("starting_price"),
  startingOriginalPrice: integer("starting_original_price"),

  // 🎯 Marketing
  badge: text("badge"),
  highlight: text("highlight"),

  // 🏷️ Metadata
  tags: jsonb("tags").$type<string[]>(),
  icon: text("icon"),
  thumbnail: text("thumbnail"),

  // 📦 Simple info
  duration: integer("duration"), //in days
  level: programLevelEnum("level").default("beginner").notNull(),
  format: programFormatEnum("format").default("online").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

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

  // CMS flexible sections
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const programBatches = pgTable("batch", {
  id: text("id").primaryKey(),

  teacherId: text("teacher_id").references(() => user.id, {
    onDelete: "set null",
  }),

  programId: text("program_id")
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  type: programBatchTypeEnum("type").default("scheduled").notNull(),
  isUnlimited: boolean("is_unlimited").default(false).notNull(),

  slug: text("slug").notNull().unique(),
  price: integer("price"),
  originalPrice: integer("original_price"),

  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),

  capacity: integer("capacity"),
  enrolledCount: integer("enrolled_count").default(0),
  status: programBatchStatusEnum("status").default("draft").notNull(),

  isOpen: boolean("is_open").default(true).notNull(),

  mode: programBatchModeEnum("mode"),

  location: text("location"),

  meetingDays: jsonb("meeting_days"),
  meetingTime: text("meeting_time"),

  materials: jsonb("materials").$type<
    Array<{
      label: string;
      type?: MaterialType;
      url: string;
    }>
  >(),

  primaryCta: jsonb("primary_cta").$type<{
    label: string;
    href: string;
    icon?: string;
  }>(),

  secondaryCta: jsonb("secondary_cta").$type<{
    label: string;
    href: string;
    icon?: string;
  }>(),

  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const programContent = pgTable("program_content", {
  id: text("id").primaryKey(),

  programId: text("program_id")
    .notNull()
    .unique()
    .references(() => programs.id, { onDelete: "cascade" }),

  // 🎯 THE MOST IMPORTANT FIELD
  sections: jsonb("sections").$type<ProgramSection[]>(),

  // Optional extras
  hasBatch: boolean("has_batch").default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const programBatchRelations = relations(programBatches, ({ one }) => ({
  program: one(programs, {
    fields: [programBatches.programId],
    references: [programs.id],
  }),
}));

export const programRelations = relations(programs, ({ one, many }) => ({
  category: one(programCategories, {
    fields: [programs.categoryId],
    references: [programCategories.id],
  }),
  content: one(programContent),
  batches: many(programBatches),
}));
