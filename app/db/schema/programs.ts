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

export const programCategoryStatusEnum = pgEnum("program_category_status", [
  "draft",
  "published",
  "archived",
]);

export const programStatusEnum = pgEnum("program_status", [
  "draft",
  "published",
  "archived",
]);

export const programs = pgTable(
  "programs",
  {
    id: text("id").primaryKey(),

    title: text("title").notNull(),
    slug: text("slug").notNull(),

    description: text("description").notNull(),
    shortDesc: text("short_desc"),

    categoryId: text("category_id")
      .notNull()
      .references(() => programCategories.id, { onDelete: "cascade" }),

    status: programStatusEnum("status").default("draft").notNull(),

    order: integer("order").default(0),

    // 💰 Pricing
    basePrice: integer("base_price"),
    originalPrice: integer("original_price"),
    priceTiers: jsonb("price_tiers").$type<PriceTier[]>(),

    // 🎯 Marketing
    badge: text("badge"),
    highlight: text("highlight"),

    // 🏷️ Metadata
    tags: jsonb("tags").$type<string[]>(),
    icon: text("icon"),
    thumbnail: text("thumbnail"),

    // 📦 Simple info
    duration: text("duration"),
    format: text("format"),
    level: text("level"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqueSlugPerCategory: unique().on(table.slug, table.categoryId),
  }),
);

export const programCategories = pgTable("program_categories", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
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
  batches: jsonb("batches").$type<ProgramBatch[]>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const batch = pgTable("batch", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  programId: text("program_id")
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),

  title: text("title"), // e.g. "Jan 2026 Batch"
  slug: text("slug"),

  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),

  capacity: integer("capacity"), // max students

  mode: text("mode"), // online | offline | hybrid

  location: text("location"), // for camp / offline

  meetingDays: jsonb("meeting_days"), // ["Mon", "Tue"]
  meetingTime: text("meeting_time"), // "20:00"

  status: text("status").default("draft"), // draft | open | full | completed

  createdAt: timestamp("created_at").defaultNow().notNull(),
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

export const programRelations = relations(programs, ({ one }) => ({
  category: one(programCategories, {
    fields: [programs.categoryId],
    references: [programCategories.id],
  }),
  content: one(programContent),
}));
