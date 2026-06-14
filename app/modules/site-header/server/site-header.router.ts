// app/modules/site-header/server/site-header.router.ts

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import { role, userRole } from "@/app/db/schema/roles";
import { siteHeaderSettings } from "@/app/db/schema/site-header";
import {
  getSiteHeaderSettings,
  SITE_HEADER_SETTINGS_ID,
} from "./site-header.service";

/* =========================================================
   HELPERS
========================================================= */

function cleanText(value?: string | null) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function getActorUserId(ctx: unknown) {
  const c = ctx as {
    authUserId?: string | null;
    auth?: { userId?: string | null };
    session?: { user?: { id?: string | null } };
    user?: { id?: string | null };
  };

  return (
    c.authUserId ??
    c.auth?.userId ??
    c.session?.user?.id ??
    c.user?.id ??
    null
  );
}

async function assertCanManageSiteHeader(ctx: unknown) {
  const actorUserId = getActorUserId(ctx);

  if (!actorUserId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Anda harus login terlebih dahulu.",
    });
  }

  const rows = await db
    .select({
      roleName: role.name,
    })
    .from(userRole)
    .innerJoin(role, eq(role.id, userRole.roleId))
    .where(eq(userRole.userId, actorUserId));

  const allowed = rows.some(
    (row) => row.roleName === "admin" || row.roleName === "super_admin",
  );

  if (!allowed) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Hanya admin yang bisa mengubah Site Header.",
    });
  }
}

/* =========================================================
   INPUT
========================================================= */

const updateSiteHeaderSettingsInput = z.object({
  siteName: z.string().trim().min(1).max(120),

  metaTitle: z.string().trim().min(1).max(180),
  metaDescription: z.string().trim().min(1).max(300),
  metaKeywords: z.string().trim().max(500).nullable().optional(),

  ogTitle: z.string().trim().max(180).nullable().optional(),
  ogDescription: z.string().trim().max(300).nullable().optional(),
  ogImageUrl: z.string().trim().max(1000).nullable().optional(),

  faviconUrl: z.string().trim().max(1000).nullable().optional(),
  appleTouchIconUrl: z.string().trim().max(1000).nullable().optional(),

  canonicalUrl: z.string().trim().max(1000).nullable().optional(),
  themeColor: z.string().trim().max(32).nullable().optional(),

  googleAnalyticsId: z.string().trim().max(80).nullable().optional(),
  googleTagManagerId: z.string().trim().max(80).nullable().optional(),
  metaPixelId: z.string().trim().max(80).nullable().optional(),

  customHeadScript: z.string().max(8000).nullable().optional(),
  customBodyStartHtml: z.string().max(8000).nullable().optional(),
  customBodyEndScript: z.string().max(8000).nullable().optional(),

  isActive: z.boolean().default(true),
});

export type SiteHeaderSettingsResult = Awaited<
  ReturnType<typeof getSiteHeaderSettings>
>;

/* =========================================================
   ROUTER
========================================================= */

export const siteHeaderRouter = createTRPCRouter({
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    await assertCanManageSiteHeader(ctx);

    return getSiteHeaderSettings();
  }),

  updateSettings: protectedProcedure
    .input(updateSiteHeaderSettingsInput)
    .mutation(async ({ input, ctx }) => {
      await assertCanManageSiteHeader(ctx);

      const values = {
        id: SITE_HEADER_SETTINGS_ID,

        siteName: input.siteName,

        metaTitle: input.metaTitle,
        metaDescription: input.metaDescription,
        metaKeywords: cleanText(input.metaKeywords),

        ogTitle: cleanText(input.ogTitle),
        ogDescription: cleanText(input.ogDescription),
        ogImageUrl: cleanText(input.ogImageUrl),

        faviconUrl: cleanText(input.faviconUrl),
        appleTouchIconUrl: cleanText(input.appleTouchIconUrl),

        canonicalUrl: cleanText(input.canonicalUrl),
        themeColor: cleanText(input.themeColor) ?? "#1a52c8",

        googleAnalyticsId: cleanText(input.googleAnalyticsId),
        googleTagManagerId: cleanText(input.googleTagManagerId),
        metaPixelId: cleanText(input.metaPixelId),

        customHeadScript: cleanText(input.customHeadScript),
        customBodyStartHtml: cleanText(input.customBodyStartHtml),
        customBodyEndScript: cleanText(input.customBodyEndScript),

        isActive: input.isActive,

        updatedAt: new Date(),
      };

      const [row] = await db
        .insert(siteHeaderSettings)
        .values(values)
        .onConflictDoUpdate({
          target: siteHeaderSettings.id,
          set: values,
        })
        .returning();

      revalidatePath("/", "layout");

      return row;
    }),
});