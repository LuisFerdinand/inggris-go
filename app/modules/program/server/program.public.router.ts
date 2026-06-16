// app/modules/program/server/program.public.router.ts
//
// PUBLIC, UNAUTHENTICATED reads for the marketing site.
// Kept separate from the protected dashboard router so the public pages can
// fetch published data without an admin session.
//
// Uses `baseProcedure` (the unauthenticated procedure from "@/lib/trpc/init"),
// so the public site can read published data without an admin session.

import { z } from "zod";
import { and, asc, eq, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, baseProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import {
  programs,
  programCategories,
  programBatches,
  programPackages,
  programContent,
} from "@/app/db/schema";

const PUBLISHED = "published" as const;

const DURATION_UNITS = [
  { factor: 10080, label: "minggu" },
  { factor: 1440, label: "hari" },
  { factor: 60, label: "jam" },
  { factor: 1, label: "menit" },
] as const;

function formatProgramDuration(totalMinutes: number | null | undefined) {
  if (!totalMinutes || totalMinutes <= 0) return null;

  const unit =
    DURATION_UNITS.find((u) => totalMinutes % u.factor === 0) ??
    DURATION_UNITS[DURATION_UNITS.length - 1];

  const value = totalMinutes / unit.factor;

  return `${value} ${unit.label}`;
}

export const programPublicRouter = createTRPCRouter({
  /**
   * All published categories (ordered) with a slim list of their published
   * programs. Powers the navbar "Program Kami" dropdown.
   */
  menu: baseProcedure.query(async () => {
    const cats = await db.query.programCategories.findMany({
      where: eq(programCategories.status, PUBLISHED),
      orderBy: [asc(programCategories.order)],
    });
    if (cats.length === 0) return [];

    const progs = await db.query.programs.findMany({
      where: and(
        inArray(
          programs.categoryId,
          cats.map((c) => c.id),
        ),
        eq(programs.status, PUBLISHED),
      ),
      orderBy: [asc(programs.createdAt)],
    });

    return cats.map((c) => ({
      slug: c.slug,
      label: c.label,
      shortLabel: c.shortLabel ?? null,
      icon: c.icon ?? null,
      themePrimary: c.themePrimary,
      tagline: c.tagline ?? null,
      description: c.description ?? null,
      href: `/programs/${c.slug}`,
      programs: progs
        .filter((p) => p.categoryId === c.id)
        .map((p) => ({
          slug: p.slug,
          title: p.title,
          icon: p.icon ?? null,
          badge: p.badge ?? null,
          href: `/programs/${c.slug}/${p.slug}`,
        })),
    }));
  }),

  /** A single published category by slug (for /programs/[categorySlug]). */
  categoryBySlug: baseProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const category = await db.query.programCategories.findFirst({
        where: and(
          eq(programCategories.slug, input.slug),
          eq(programCategories.status, PUBLISHED),
        ),
      });
      return category ?? null; // null → caller falls back to static data
    }),

  /** All published programs within a category slug (for category listing). */
  programsByCategory: baseProcedure
    .input(z.object({ categorySlug: z.string().min(1) }))
    .query(async ({ input }) => {
      const category = await db.query.programCategories.findFirst({
        where: eq(programCategories.slug, input.categorySlug),
      });
      if (!category) return [];

      const progs = await db.query.programs.findMany({
        where: and(
          eq(programs.categoryId, category.id),
          eq(programs.status, PUBLISHED),
        ),
        orderBy: [asc(programs.createdAt)],
      });
      if (progs.length === 0) return [];

      // One query for all packages across these programs, then group.
      const pkgs = await db.query.programPackages.findMany({
        where: inArray(
          programPackages.programId,
          progs.map((p) => p.id),
        ),
        orderBy: [asc(programPackages.order)],
      });

      return progs.map((p) => {
        const packages = pkgs.filter((k) => k.programId === p.id);
        const prices = packages
          .map((k) => k.price)
          .filter((n): n is number => typeof n === "number");

        return {
          ...p,
          durationMinutes: p.duration,
          duration: formatProgramDuration(p.duration),
          packages,
          startingPrice: prices.length ? Math.min(...prices) : null,
        };
      });
    }),

  /**
   * Full published program detail by slug — the composite the detail page
   * needs: program row, its category, landing-content sections, batches (with
   * packages), and direct packages.
   */
  programDetailBySlug: baseProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const program = await db.query.programs.findFirst({
        where: and(
          eq(programs.slug, input.slug),
          eq(programs.status, PUBLISHED),
        ),
      });
      if (!program) return null; // null → caller falls back to static

      const [category, content, batches, packages] = await Promise.all([
        db.query.programCategories.findFirst({
          where: eq(programCategories.id, program.categoryId),
        }),
        db.query.programContent.findFirst({
          where: eq(programContent.programId, program.id),
        }),
        db.query.programBatches.findMany({
          where: eq(programBatches.programId, program.id),
          orderBy: [asc(programBatches.order)],
          with: { packages: true },
        }),
        db.query.programPackages.findMany({
          where: eq(programPackages.programId, program.id),
          orderBy: [asc(programPackages.order)],
        }),
      ]);

      return {
        program: {
          ...program,
          durationMinutes: program.duration,
          duration: formatProgramDuration(program.duration),
        },
        category: category ?? null,
        sections: (content?.sections ?? []) as unknown[],
        theme: content?.theme ?? null,
        isPublished: content?.isPublished ?? false,
        batches: batches.map((b) => ({
          ...b,
          packages: [...(b.packages ?? [])].sort((a, c) => a.order - c.order),
        })),
        directPackages: packages.filter((p) => !p.batchId),
      };
    }),

  /**
   * Lightweight commerce payload for the registration form: just what's needed
   * to render package/batch choices and create an order.
   */
  registrationOptions: baseProcedure
    .input(z.object({ programSlug: z.string().min(1) }))
    .query(async ({ input }) => {
      const program = await db.query.programs.findFirst({
        where: and(
          eq(programs.slug, input.programSlug),
          eq(programs.status, PUBLISHED),
        ),
      });
      if (!program) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan atau belum dipublikasikan",
        });
      }

      const [batches, packages] = await Promise.all([
        db.query.programBatches.findMany({
          where: eq(programBatches.programId, program.id),
          orderBy: [asc(programBatches.order)],
          with: { packages: true },
        }),
        db.query.programPackages.findMany({
          where: eq(programPackages.programId, program.id),
          orderBy: [asc(programPackages.order)],
        }),
      ]);

      return {
        program: {
          id: program.id,
          slug: program.slug,
          title: program.title,
          scheduleType: program.scheduleType,
          categoryId: program.categoryId,
        },
        batches: batches.map((b) => ({
          id: b.id,
          title: b.title,
          status: b.status,
          startDate: b.startDate,
          endDate: b.endDate,
          capacity: b.capacity,
          enrolledCount: b.enrolledCount,
          packages: [...(b.packages ?? [])]
            .sort((a, c) => a.order - c.order)
            .map((p) => ({
              id: p.id,
              title: p.title,
              price: p.price,
              originalPrice: p.originalPrice,
              isDefault: p.isDefault,
            })),
        })),
        directPackages: packages
          .filter((p) => !p.batchId)
          .map((p) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            originalPrice: p.originalPrice,
            isDefault: p.isDefault,
          })),
      };
    }),
});