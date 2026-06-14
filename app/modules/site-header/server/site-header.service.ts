// app/modules/site-header/server/site-header.service.ts

import { eq } from "drizzle-orm";

import { db } from "@/app/db/db";
import { siteHeaderSettings } from "@/app/db/schema/site-header";

export const SITE_HEADER_SETTINGS_ID = "default";

export const DEFAULT_SITE_HEADER_SETTINGS = {
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

  ogImageUrl: null as string | null,
  faviconUrl: null as string | null,
  appleTouchIconUrl: null as string | null,

  canonicalUrl: null as string | null,
  themeColor: "#1a52c8",

  googleAnalyticsId: null as string | null,
  googleTagManagerId: null as string | null,
  metaPixelId: null as string | null,

  customHeadScript: null as string | null,
  customBodyStartHtml: null as string | null,
  customBodyEndScript: null as string | null,

  isActive: true,

  createdAt: new Date(),
  updatedAt: new Date(),
};

export async function getSiteHeaderSettings() {
  const [row] = await db
    .select()
    .from(siteHeaderSettings)
    .where(eq(siteHeaderSettings.id, SITE_HEADER_SETTINGS_ID))
    .limit(1);

  return {
    ...DEFAULT_SITE_HEADER_SETTINGS,
    ...row,
  };
}