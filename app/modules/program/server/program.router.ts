// app/modules/program/server/program.router.ts
import { z } from "zod";
import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";

import {
  programs,
  programCategories,
  programBatches,
  programPackages,
  programContent,
} from "@/app/db/schema";
import { enrollments } from "@/app/db/schema";

import type {
  ProgramStatus,
  ProgramFormat,
  ProgramLevel,
  ProgramScheduleType,
} from "@/lib/enums/enums";
import { PROGRAM_STATUS } from "@/lib/enums/enums";

import {
  programFilterSchema,
  programInsertSchema,
  programUpdateSchema,
} from "../program.schema";

import { generateUniqueSlug, getNextOrder } from "./program.slug";
import { generateSlug } from "@/lib/utils";

/* =========================================================
   PUBLIC TYPE — consumed by the data table & columns
========================================================= */

export type FilteredProgram = {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  status: ProgramStatus;
  format: ProgramFormat;
  level: ProgramLevel;
  duration: number | null;
  scheduleType: ProgramScheduleType;
  registrationType: "online" | "offline";
  startingPrice: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  category: { id: string; label: string; slug: string } | null;
  batchCount: number;
  packageCount: number;
};

/* =========================================================
   PUBLIC TYPES — detail & overview (inferred by consumers)
   getDetail returns a shape that matches DetailData in
   detail/index.tsx; getOverview matches the OverviewHero/
   OverviewSections props.
========================================================= */

export type DetailData = Awaited<
  ReturnType<typeof buildDetail>
>;

export type OverviewData = Awaited<
  ReturnType<typeof buildOverview>
>;

/* =========================================================
   SECTION INPUT SCHEMAS
========================================================= */

const identityInput = z.object({
  id: z.string(),
  title: z.string().min(3).max(100),
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDesc: z.string().max(200).optional().or(z.literal("")),
  description: z.string().min(10),
  categoryId: z.string().min(1),
});

const structureInput = z.object({
  id: z.string(),
  scheduleType: z.enum(["permanent", "scheduled"]),
  registrationType: z.enum(["online", "offline"]),
  format: z.enum(["online", "offline", "hybrid"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  duration: z.number().int().min(1).nullable().optional(),
});

const marketingInput = z.object({
  id: z.string(),
  badge: z.string().max(30).optional().or(z.literal("")),
  highlight: z.string().max(80).optional().or(z.literal("")),
  tags: z.array(z.string().max(30)).max(15),
});

const brandingInput = z.object({
  id: z.string(),
  icon: z.string().nullable().optional(),
});

/* =========================================================
   HELPERS — shared builders so the public types stay inferred
========================================================= */

// Counts every consumer needs for a single program.
async function getProgramCounts(programId: string) {
  const [counts] = await db
    .select({
      packagesCount: sql<number>`(
        select count(*) from ${programPackages}
        where ${programPackages.programId} = ${programId}
      )`.mapWith(Number),
      batchesCount: sql<number>`(
        select count(*) from ${programBatches}
        where ${programBatches.programId} = ${programId}
      )`.mapWith(Number),
      openBatchesCount: sql<number>`(
        select count(*) from ${programBatches}
        where ${programBatches.programId} = ${programId}
          and ${programBatches.status} = 'open'
      )`.mapWith(Number),
      enrollmentsCount: sql<number>`(
        select count(*) from ${enrollments}
        where ${enrollments.programId} = ${programId}
      )`.mapWith(Number),
    })
    .from(programs)
    .where(eq(programs.id, programId));

  return (
    counts ?? {
      packagesCount: 0,
      batchesCount: 0,
      openBatchesCount: 0,
      enrollmentsCount: 0,
    }
  );
}

async function fetchProgramWithCategory(id: string) {
  const program = await db.query.programs.findFirst({
    where: eq(programs.id, id),
    with: { category: true },
  });

  if (!program)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Program tidak ditemukan",
    });

  return program;
}

// Builds the exact shape DetailData (detail/index.tsx) expects.
async function buildDetail(id: string) {
  const program = await fetchProgramWithCategory(id);
  const counts = await getProgramCounts(id);

  const category = program.category;

  return {
    id: program.id,
    title: program.title,
    slug: program.slug,
    description: program.description,
    shortDesc: program.shortDesc,
    categoryId: program.categoryId,
    category: {
      id: category.id,
      label: category.label,
      slug: category.slug,
      themePrimary: category.themePrimary,
      icon: category.icon,
    },

    // Structure
    scheduleType: program.scheduleType,
    registrationType: program.registrationType,
    format: program.format,
    level: program.level,
    duration: program.duration,

    // Marketing
    badge: program.badge,
    highlight: program.highlight,
    tags: program.tags,

    // Branding
    thumbnailUrl: program.thumbnailUrl,
    thumbnailKey: program.thumbnailKey,
    icon: program.icon,

    // Publishing
    status: program.status,
    publishedAt: program.publishedAt,
    updatedAt: program.updatedAt,
    createdAt: program.createdAt,

    // Commerce (read-only)
    startingPrice: program.startingPrice,
    startingOriginalPrice: program.startingOriginalPrice,
    packagesCount: counts.packagesCount,
    activePackagesCount: counts.packagesCount, // no active flag on packages yet

    // Capabilities
    hasEnrollments: counts.enrollmentsCount > 0,
    hasPackages: counts.packagesCount > 0,
  };
}

// Builds the OverviewData shape (OverviewHero + OverviewSections).
async function buildOverview(id: string) {
  const program = await fetchProgramWithCategory(id);
  const counts = await getProgramCounts(id);
  const category = program.category;

  // Content meta (one-to-one)
  const content = await db.query.programContent.findFirst({
    where: eq(programContent.programId, id),
  });

  const sectionsCount = content?.sections?.length ?? 0;

  const publicUrl = `/programs/${category.slug}/${program.slug}`;

  // Setup health
  const hasThumbnail = !!program.thumbnailUrl;
  const hasContent = sectionsCount > 0;
  const hasPackages = counts.packagesCount > 0;
  const hasBatches = counts.batchesCount > 0;

  const checks =
    program.scheduleType === "scheduled"
      ? [hasThumbnail, hasPackages, hasBatches, hasContent]
      : [hasThumbnail, hasPackages, hasContent];

  const passed = checks.filter(Boolean).length;
  const setupProgress = Math.round((passed / checks.length) * 100);

  const issues: string[] = [];
  if (!hasThumbnail) issues.push("Thumbnail belum diunggah");
  if (!hasPackages) issues.push("Paket harga belum dibuat");
  if (program.scheduleType === "scheduled" && !hasBatches)
    issues.push("Batch belum dibuat");
  if (!hasContent) issues.push("Konten landing page kosong");

  const canPublish = hasThumbnail && hasPackages && (program.scheduleType === "permanent" || hasBatches);

  return {
    identity: {
      id: program.id,
      title: program.title,
      slug: program.slug,
      shortDesc: program.shortDesc,
      thumbnailUrl: program.thumbnailUrl,
      category: { id: category.id, label: category.label, slug: category.slug },
      badge: program.badge,
      highlight: program.highlight,
      status: program.status,
    },
    publishing: {
      status: program.status,
      publishedAt: program.publishedAt,
      publicUrl,
    },
    metrics: {
      batchesCount: counts.batchesCount,
      openBatchesCount: counts.openBatchesCount,
      packagesCount: counts.packagesCount,
      contentSectionsCount: sectionsCount,
      enrollmentsCount: counts.enrollmentsCount,
      startingPrice: program.startingPrice,
      startingOriginalPrice: program.startingOriginalPrice,
    },
    configuration: {
      scheduleType: program.scheduleType,
      registrationType: program.registrationType,
      format: program.format,
      level: program.level,
      duration: program.duration,
    },
    health: {
      setupProgress,
      issues,
      hasThumbnail,
      hasContent,
      hasPackages,
      hasBatches,
    },
    quickActions: {
      canPublish,
      canCreateBatch: program.scheduleType === "scheduled",
      canCreatePackage: true,
      canEditContent: true,
    },
    activity: {
      updatedAt: program.updatedAt,
      contentUpdatedAt: content?.updatedAt ?? null,
      createdAt: program.createdAt,
    },
  };
}

/* =========================================================
   ROUTER
========================================================= */

export const programRouter = createTRPCRouter({
  // ── List (server-side filtering, counts joined) ──────────
  getFiltered: protectedProcedure
    .input(programFilterSchema)
    .query(async ({ input }): Promise<FilteredProgram[]> => {
      const conditions = [];

      if (input.status) conditions.push(eq(programs.status, input.status));
      if (input.categoryId)
        conditions.push(eq(programs.categoryId, input.categoryId));
      if (input.format) conditions.push(eq(programs.format, input.format));
      if (input.level) conditions.push(eq(programs.level, input.level));
      if (input.scheduleType)
        conditions.push(eq(programs.scheduleType, input.scheduleType));
      if (input.registrationType)
        conditions.push(eq(programs.registrationType, input.registrationType));
      if (input.searchQuery)
        conditions.push(ilike(programs.title, `%${input.searchQuery}%`));

      const rows = await db
        .select({
          id: programs.id,
          title: programs.title,
          slug: programs.slug,
          thumbnailUrl: programs.thumbnailUrl,
          status: programs.status,
          format: programs.format,
          level: programs.level,
          duration: programs.duration,
          scheduleType: programs.scheduleType,
          registrationType: programs.registrationType,
          startingPrice: programs.startingPrice,
          createdAt: programs.createdAt,
          updatedAt: programs.updatedAt,

          categoryId: programCategories.id,
          categoryLabel: programCategories.label,
          categorySlug: programCategories.slug,

          batchCount: sql<number>`(
            select count(*) from ${programBatches}
            where ${programBatches.programId} = ${programs.id}
          )`.mapWith(Number),

          packageCount: sql<number>`(
            select count(*) from ${programPackages}
            where ${programPackages.programId} = ${programs.id}
          )`.mapWith(Number),
        })
        .from(programs)
        .leftJoin(
          programCategories,
          eq(programs.categoryId, programCategories.id),
        )
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(programs.createdAt));

      return rows.map(({ categoryId, categoryLabel, categorySlug, ...r }) => ({
        ...r,
        category:
          categoryId && categoryLabel
            ? { id: categoryId, label: categoryLabel, slug: categorySlug! }
            : null,
      }));
    }),

  // ── Categories (for selects) ─────────────────────────────
  getCategories: protectedProcedure.query(async () => {
    return db
      .select({
        id: programCategories.id,
        label: programCategories.label,
        slug: programCategories.slug,
        icon: programCategories.icon,
      })
      .from(programCategories)
      .orderBy(programCategories.order);
  }),

  // ── Single program (raw row, for the simple edit form) ───
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return fetchProgramWithCategory(input.id);
    }),

  // ── Detail (tab: detail) ─────────────────────────────────
  getDetail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }): Promise<DetailData> => buildDetail(input.id)),

  // ── Overview (tab: overview) ─────────────────────────────
  getOverview: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }): Promise<OverviewData> => buildOverview(input.id)),

  // ── Unique slug generator (live, while typing title) ─────
  getUniqueSlug: protectedProcedure
    .input(z.object({ title: z.string(), excludeId: z.string().optional() }))
    .query(async ({ input }) => {
      const slug = await generateUniqueSlug({
        table: programs,
        slugColumn: programs.slug,
        idColumn: programs.id,
        title: input.title,
        excludeId: input.excludeId,
      });
      return { slug };
    }),

  // ── Batches (tab: batches) ───────────────────────────────
  getBatches: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const program = await fetchProgramWithCategory(input.id);

      const batchRows = await db.query.programBatches.findMany({
        where: eq(programBatches.programId, input.id),
        orderBy: [asc(programBatches.order)],
        with: {
          packages: true,
        },
      });

      const counts = await getProgramCounts(input.id);

      const batches = batchRows.map((b) => {
        const occupancyRate =
          b.capacity && b.capacity > 0 ? b.enrolledCount / b.capacity : 0;
        const isFull = !!b.capacity && b.enrolledCount >= b.capacity;
        return {
          ...b,
          teacher: null as { id: string; name: string; avatar?: string | null } | null,
          ui: {
            isAlmostFull: occupancyRate >= 0.8 && !isFull,
            isFull,
            isOpen: b.status === "open",
            isOngoing: b.status === "ongoing",
            occupancyRate,
          },
        };
      });

      return {
        program: { id: program.id, scheduleType: program.scheduleType },
        batches,
        metrics: {
          batchesCount: counts.batchesCount,
          openBatchesCount: counts.openBatchesCount,
        },
      };
    }),

  // ── Create ───────────────────────────────────────────────
  create: protectedProcedure
    .input(programInsertSchema)
    .mutation(async ({ input }) => {
      const { order: _ignoredOrder, ...values } = input;

      const slug = await generateUniqueSlug({
        table: programs,
        slugColumn: programs.slug,
        title: input.slug || input.title,
      });

      const order = await getNextOrder({
        table: programs,
        orderColumn: programs.order,
      });

      const [row] = await db
        .insert(programs)
        .values({
          ...values,
          id: crypto.randomUUID(),
          slug,
          order,
          publishedAt: input.status === "published" ? new Date() : null,
        })
        .returning();

      return row;
    }),

  // ── Update (full, from the simple edit form) ─────────────
  update: protectedProcedure
    .input(programUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, slug, ...rest } = input;

      const nextSlug = slug
        ? await generateUniqueSlug({
            table: programs,
            slugColumn: programs.slug,
            idColumn: programs.id,
            title: slug,
            excludeId: id,
          })
        : undefined;

      const [row] = await db
        .update(programs)
        .set({
          ...rest,
          ...(nextSlug ? { slug: nextSlug } : {}),
          ...(rest.status === "published" ? { publishedAt: new Date() } : {}),
        })
        .where(eq(programs.id, id))
        .returning();

      if (!row)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan",
        });

      return row;
    }),

  // ── Update identity (IdentitySection) ────────────────────
  updateIdentity: protectedProcedure
    .input(identityInput)
    .mutation(async ({ input }) => {
      const { id, slug, ...rest } = input;

      const nextSlug = await generateUniqueSlug({
        table: programs,
        slugColumn: programs.slug,
        idColumn: programs.id,
        title: slug,
        excludeId: id,
      });

      const [row] = await db
        .update(programs)
        .set({
          ...rest,
          shortDesc: rest.shortDesc || null,
          slug: nextSlug,
        })
        .where(eq(programs.id, id))
        .returning();

      if (!row)
        throw new TRPCError({ code: "NOT_FOUND", message: "Program tidak ditemukan" });

      return { id: row.id, slug: row.slug };
    }),

  // ── Update structure (StructureSection) ──────────────────
  updateStructure: protectedProcedure
    .input(structureInput)
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;

      const [row] = await db
        .update(programs)
        .set({
          scheduleType: rest.scheduleType,
          registrationType: rest.registrationType,
          format: rest.format,
          level: rest.level,
          duration: rest.duration ?? null,
        })
        .where(eq(programs.id, id))
        .returning();

      if (!row)
        throw new TRPCError({ code: "NOT_FOUND", message: "Program tidak ditemukan" });

      return row;
    }),

  // ── Update marketing (MarketingSection) ──────────────────
  updateMarketing: protectedProcedure
    .input(marketingInput)
    .mutation(async ({ input }) => {
      const { id, badge, highlight, tags } = input;

      const [row] = await db
        .update(programs)
        .set({
          badge: badge || null,
          highlight: highlight || null,
          tags,
        })
        .where(eq(programs.id, id))
        .returning();

      if (!row)
        throw new TRPCError({ code: "NOT_FOUND", message: "Program tidak ditemukan" });

      return row;
    }),

  // ── Update branding icon (BrandingSection) ───────────────
  updateBranding: protectedProcedure
    .input(brandingInput)
    .mutation(async ({ input }) => {
      const [row] = await db
        .update(programs)
        .set({ icon: input.icon ?? null })
        .where(eq(programs.id, input.id))
        .returning();

      if (!row)
        throw new TRPCError({ code: "NOT_FOUND", message: "Program tidak ditemukan" });

      return row;
    }),

  // ── Remove thumbnail (BrandingSection) ───────────────────
  removeThumbnail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const [row] = await db
        .update(programs)
        .set({ thumbnailUrl: null, thumbnailKey: null, thumbnailBlurDataUrl: null })
        .where(eq(programs.id, input.id))
        .returning();

      if (!row)
        throw new TRPCError({ code: "NOT_FOUND", message: "Program tidak ditemukan" });

      return row;
    }),

  // ── Update status (PublishingSection) ────────────────────
  updateStatus: protectedProcedure
    .input(z.object({ id: z.string(), status: z.enum(PROGRAM_STATUS) }))
    .mutation(async ({ input }) => {
      const [row] = await db
        .update(programs)
        .set({
          status: input.status,
          ...(input.status === "published" ? { publishedAt: new Date() } : {}),
        })
        .where(eq(programs.id, input.id))
        .returning();

      if (!row)
        throw new TRPCError({ code: "NOT_FOUND", message: "Program tidak ditemukan" });

      return row;
    }),

  // ── Set status (kept from before; table row actions) ─────
  setStatus: protectedProcedure
    .input(z.object({ id: z.string(), status: z.enum(PROGRAM_STATUS) }))
    .mutation(async ({ input }) => {
      const [row] = await db
        .update(programs)
        .set({
          status: input.status,
          ...(input.status === "published" ? { publishedAt: new Date() } : {}),
        })
        .where(eq(programs.id, input.id))
        .returning();

      if (!row)
        throw new TRPCError({ code: "NOT_FOUND", message: "Program tidak ditemukan" });

      return row;
    }),

  // ── Duplicate ────────────────────────────────────────────
  duplicate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const original = await db.query.programs.findFirst({
        where: eq(programs.id, input.id),
      });

      if (!original)
        throw new TRPCError({ code: "NOT_FOUND", message: "Program tidak ditemukan" });

      const { createdAt, updatedAt, publishedAt, order, ...rest } = original;

      const slug = await generateUniqueSlug({
        table: programs,
        slugColumn: programs.slug,
        title: `${original.title} Salinan`,
      });

      const nextOrder = await getNextOrder({
        table: programs,
        orderColumn: programs.order,
      });

      const [row] = await db
        .insert(programs)
        .values({
          ...rest,
          id: crypto.randomUUID(),
          title: `${original.title} (Salinan)`,
          slug,
          order: nextOrder,
          status: "draft",
          publishedAt: null,
        })
        .returning();

      return row;
    }),

  // ── Delete ───────────────────────────────────────────────
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(programs).where(eq(programs.id, input.id));
      return { success: true };
    }),
});