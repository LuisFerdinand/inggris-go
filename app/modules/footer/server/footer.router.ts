// app/modules/footer/server/footer.router.ts

import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  baseProcedure,
} from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import { footerSettings } from "@/app/db/schema/footer";

/* =========================================================
   SCHEMAS
========================================================= */

const SINGLETON_ID = "singleton" as const;

const updateFooterInput = z.object({
  tagline: z.string().trim().nullable().optional(),
  description: z.string().trim().nullable().optional(),

  instagramUrl: z.string().trim().nullable().optional(),
  tiktokUrl: z.string().trim().nullable().optional(),
  youtubeUrl: z.string().trim().nullable().optional(),
  facebookUrl: z.string().trim().nullable().optional(),
  twitterUrl: z.string().trim().nullable().optional(),
  linkedinUrl: z.string().trim().nullable().optional(),

  whatsappNumber: z.string().trim().nullable().optional(),
  whatsappLabel: z.string().trim().nullable().optional(),
  email: z.string().trim().nullable().optional(),
  contactPageHref: z.string().trim().nullable().optional(),
  contactPageLabel: z.string().trim().nullable().optional(),

  locationAddress: z.string().trim().nullable().optional(),
  locationMapsUrl: z.string().trim().nullable().optional(),

  statAlumniOverride: z.number().int().positive().nullable().optional(),
  statProgramOverride: z.number().int().positive().nullable().optional(),
  statYearsOverride: z.number().int().positive().nullable().optional(),
  statRatingOverride: z.string().trim().nullable().optional(),

  ctaText: z.string().trim().nullable().optional(),
  ctaButtonLabel: z.string().trim().nullable().optional(),
  ctaButtonHref: z.string().trim().nullable().optional(),

  privacyHref: z.string().trim().nullable().optional(),
  privacyLabel: z.string().trim().nullable().optional(),
  termsHref: z.string().trim().nullable().optional(),
  termsLabel: z.string().trim().nullable().optional(),
  locationTagline: z.string().trim().nullable().optional(),

  programLinks: z.string().trim().nullable().optional(),

  isActive: z.boolean().optional(),
});

/* =========================================================
   HELPERS
========================================================= */

async function getOrCreateSingleton() {
  const existing = await db.query.footerSettings.findFirst({
    where: eq(footerSettings.id, SINGLETON_ID),
  });

  if (existing) return existing;

  const [created] = await db
    .insert(footerSettings)
    .values({ id: SINGLETON_ID })
    .returning();

  if (!created) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Gagal membuat footer settings.",
    });
  }

  return created;
}

/* =========================================================
   ROUTER
========================================================= */

export const footerRouter = createTRPCRouter({
  /**
   * Public: used by the actual Footer component to render
   * dynamic content. Falls back gracefully to null fields.
   */
  getSettings: baseProcedure.query(async () => {
    return getOrCreateSingleton();
  }),

  /**
   * Admin-only: update any subset of fields.
   */
  updateSettings: protectedProcedure
    .input(updateFooterInput)
    .mutation(async ({ input }) => {
      const existing = await db.query.footerSettings.findFirst({
        where: eq(footerSettings.id, SINGLETON_ID),
      });

      if (!existing) {
        // Create with input values merged into defaults
        const [row] = await db
          .insert(footerSettings)
          .values({ id: SINGLETON_ID, ...input })
          .returning();

        return row;
      }

      const [row] = await db
        .update(footerSettings)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(footerSettings.id, SINGLETON_ID))
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal memperbarui footer settings.",
        });
      }

      return row;
    }),
});