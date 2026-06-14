// app/db/seed/site-header.seed.ts

import { sql } from "drizzle-orm";

import { db } from "@/app/db/db";
import { siteHeaderSettings } from "../schema/site-header";

const SITE_HEADER_SETTINGS_ID = "default";

const DEFAULT_SITE_HEADER_SETTINGS = {
  id: SITE_HEADER_SETTINGS_ID,

  siteName: "Inggris Go",

  metaTitle: "Inggris Go — Belajar Bahasa Inggris Tanpa Takut Salah",

  metaDescription:
    "Program speaking, English camp, dan kelas privat dari Kampung Inggris Pare. Mulai berbicara bahasa Inggris dengan percaya diri bersama Inggris Go.",

  metaKeywords:
    "belajar bahasa inggris, kampung inggris pare, english course, speaking english, english camp",

  ogTitle: "Inggris Go — Belajar Bahasa Inggris Tanpa Takut Salah",

  ogDescription:
    "Program speaking, English camp, dan kelas privat dari Kampung Inggris Pare.",

  ogImageUrl: process.env.SEED_SITE_OG_IMAGE_URL ?? null,

  faviconUrl: process.env.SEED_SITE_FAVICON_URL ?? "/favicon.ico",

  appleTouchIconUrl:
    process.env.SEED_SITE_APPLE_TOUCH_ICON_URL ?? "/apple-touch-icon.png",

  canonicalUrl: process.env.SEED_SITE_CANONICAL_URL ?? null,

  themeColor: "#1a52c8",

  googleAnalyticsId: process.env.SEED_GOOGLE_ANALYTICS_ID ?? null,

  googleTagManagerId: process.env.SEED_GOOGLE_TAG_MANAGER_ID ?? null,

  metaPixelId: process.env.SEED_META_PIXEL_ID ?? null,

  customHeadScript: null,

  customBodyStartHtml: null,

  customBodyEndScript: null,

  isActive: true,
};

export async function seedSiteHeaderSettings() {
  console.log("Seeding Site Header Settings...");

  await db
    .insert(siteHeaderSettings)
    .values(DEFAULT_SITE_HEADER_SETTINGS)
    .onConflictDoUpdate({
      target: siteHeaderSettings.id,
      set: {
        siteName: sql`excluded.site_name`,

        metaTitle: sql`excluded.meta_title`,
        metaDescription: sql`excluded.meta_description`,
        metaKeywords: sql`excluded.meta_keywords`,

        ogTitle: sql`excluded.og_title`,
        ogDescription: sql`excluded.og_description`,
        ogImageUrl: sql`excluded.og_image_url`,

        faviconUrl: sql`excluded.favicon_url`,
        appleTouchIconUrl: sql`excluded.apple_touch_icon_url`,

        canonicalUrl: sql`excluded.canonical_url`,
        themeColor: sql`excluded.theme_color`,

        googleAnalyticsId: sql`excluded.google_analytics_id`,
        googleTagManagerId: sql`excluded.google_tag_manager_id`,
        metaPixelId: sql`excluded.meta_pixel_id`,

        customHeadScript: sql`excluded.custom_head_script`,
        customBodyStartHtml: sql`excluded.custom_body_start_html`,
        customBodyEndScript: sql`excluded.custom_body_end_script`,

        isActive: sql`excluded.is_active`,

        updatedAt: new Date(),
      },
    });
}