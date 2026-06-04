// app/modules/program/server/program.router.ts
import { z } from "zod";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";

import {
  programs,
  programCategories,
  programBatches,
  programPackages,
} from "@/app/db/schema";

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
      .select({ id: programCategories.id, label: programCategories.label })
      .from(programCategories)
      .orderBy(programCategories.order);
  }),

  // ── Single program (for edit form) ───────────────────────
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const program = await db.query.programs.findFirst({
        where: eq(programs.id, input.id),
        with: { category: true },
      });

      if (!program)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan",
        });

      return program;
    }),

  // ── Create ───────────────────────────────────────────────
  create: protectedProcedure
    .input(programInsertSchema)
    .mutation(async ({ input }) => {
      // strip the form's `order` — we compute the real next order below
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

  // ── Update ───────────────────────────────────────────────
  update: protectedProcedure
    .input(programUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, slug, ...rest } = input;

      // Only regenerate slug when the form sent one. excludeId keeps the
      // current program's own slug valid (no false collision with itself).
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

  // ── Set status (archive / publish / draft) ───────────────
  setStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(PROGRAM_STATUS),
      }),
    )
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan",
        });

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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan",
        });

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