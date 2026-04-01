import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./users";

export const program = pgTable("program", {
  id: text("id").primaryKey(),

  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),

  categoryId: text("category_id")
    .notNull()
    .references(() => category.id),
  status: text("status").default("draft"), // draft | published | archived
  order: integer("order").default(0),
  basePrice: text("base_price"),
  priceTiers: jsonb("price_tiers"),

  badge: text("badge"),
  highlight: text("highlight"),
  tags: jsonb("tags"),
  icon: text("icon"),
  thumbnail: text("thumbnail"),

  link: text("link"),

  benefits: jsonb("benefits"),

  duration: text("duration"),
  format: text("format"),
  level: text("level"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const category = pgTable("category", {
  id: text("id").primaryKey(),

  key: text("key").notNull().unique(),
  label: text("label").notNull(),

  tagline: text("tagline"),
  taglineAccent: text("tagline_accent"),
  description: text("description"),
  forWho: text("for_who"),

  accent: text("accent"),
  accentLight: text("accent_light"),
  heroGradient: text("hero_gradient"),

  // CMS flexible sections
  painPoints: jsonb("pain_points"),
  benefits: jsonb("benefits"),
  steps: jsonb("steps"),
  experience: jsonb("experience"),
  comparison: jsonb("comparison"),
  socialProof: jsonb("social_proof"),
  cta: jsonb("cta"),
  emptyState: jsonb("empty_state"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const programContent = pgTable("program_content", {
  id: text("id").primaryKey(),

  programId: text("program_id")
    .notNull()
    .unique() // 1:1 with program
    .references(() => program.id, { onDelete: "cascade" }),

  // HERO
  hero: jsonb("hero"),

  // WHY
  why: jsonb("why"),

  // STEPS (optional)
  steps: jsonb("steps"),

  // BENEFITS
  benefits: jsonb("benefits"),

  // TIMELINE
  timeline: jsonb("timeline"),

  // GALLERY (optional)
  gallery: jsonb("gallery"),

  // OFFER (optional)
  offer: jsonb("offer"),

  // BONUS
  bonus: jsonb("bonus"),

  // FAQ
  faq: jsonb("faq"),

  // TESTIMONIAL
  testimonial: jsonb("testimonial"),

  // CTA
  cta: jsonb("cta"),

  // FLAGS (for optional sections)
  hasSteps: boolean("has_steps").default(false),
  hasGallery: boolean("has_gallery").default(false),
  hasOffer: boolean("has_offer").default(false),
  hasBonus: boolean("has_bonus").default(false),
  hasTestimonial: boolean("has_testimonial").default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const batch = pgTable("batch", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  programId: text("program_id")
    .notNull()
    .references(() => program.id, { onDelete: "cascade" }),

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

export const categoryRelations = relations(category, ({ many }) => ({
  programs: many(program),
}));

export const programContentRelations = relations(programContent, ({ one }) => ({
  program: one(program, {
    fields: [programContent.programId],
    references: [program.id],
  }),
}));

export const programRelations = relations(program, ({ one }) => ({
  category: one(category, {
    fields: [program.categoryId],
    references: [category.id],
  }),
  content: one(programContent),
}));
