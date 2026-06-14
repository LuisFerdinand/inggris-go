// app/db/schema/site-header.ts

import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const siteHeaderSettings = pgTable("site_header_settings", {
  id: text("id").primaryKey(),

  siteName: text("site_name").notNull().default("Inggris Go"),

  metaTitle: text("meta_title").notNull().default(
    "Inggris Go — Belajar Bahasa Inggris Tanpa Takut Salah",
  ),

  metaDescription: text("meta_description").notNull().default(
    "Program speaking, English camp, dan kelas privat dari Kampung Inggris Pare. Mulai berbicara bahasa Inggris dengan percaya diri bersama Inggris Go.",
  ),

  metaKeywords: text("meta_keywords").default(
    "belajar bahasa inggris, kampung inggris pare, english course, speaking english, english camp",
  ),

  ogTitle: text("og_title").default(
    "Inggris Go — Belajar Bahasa Inggris Tanpa Takut Salah",
  ),

  ogDescription: text("og_description").default(
    "Program speaking, English camp, dan kelas privat dari Kampung Inggris Pare.",
  ),

  ogImageUrl: text("og_image_url"),

  faviconUrl: text("favicon_url"),
  appleTouchIconUrl: text("apple_touch_icon_url"),

  canonicalUrl: text("canonical_url"),
  themeColor: text("theme_color").default("#1a52c8"),

  googleAnalyticsId: text("google_analytics_id"),
  googleTagManagerId: text("google_tag_manager_id"),
  metaPixelId: text("meta_pixel_id"),

  /**
   * Advanced integration fields.
   *
   * Store JavaScript code only, without wrapping <script> tags.
   * Example:
   * console.log("hello")
   */
  customHeadScript: text("custom_head_script"),
  customBodyEndScript: text("custom_body_end_script"),

  /**
   * Store body-start HTML for things like noscript snippets.
   * Only admin/super_admin should be allowed to edit this.
   */
  customBodyStartHtml: text("custom_body_start_html"),

  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type SiteHeaderSettings = typeof siteHeaderSettings.$inferSelect;
export type NewSiteHeaderSettings = typeof siteHeaderSettings.$inferInsert;