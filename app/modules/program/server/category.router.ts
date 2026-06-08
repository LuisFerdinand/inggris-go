// app/modules/program/server/category.router.ts
import { z } from "zod";
import { and, asc, count, eq, ilike, SQL } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import { programCategories, programs } from "@/app/db/schema";

import type { ProgramCategoryStatus } from "@/lib/enums/enums";

import { generateUniqueSlug, getNextOrder } from "./program.slug";
import {
  categoryFilterSchema,
  categoryInsertSchema,
  categoryUpdateSchema,
} from "../category.schema";

/* =========================================================
   PUBLIC TYPES
========================================================= */

export type FilteredCategory = {
  id: string;
  slug: string;
  label: string;
  shortLabel: string | null;
  status: ProgramCategoryStatus;
  icon: string | null;
  heroImage: string | null;
  themePrimary: string;
  tagline: string | null;
  description: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date | null;
  programCount: number;
};

const idInput = z.object({ id: z.string().min(1) });

/* =========================================================
   HELPERS
========================================================= */

async function fetchCategory(id: string) {
  const category = await db.query.programCategories.findFirst({
    where: eq(programCategories.id, id),
  });

  if (!category) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Kategori tidak ditemukan",
    });
  }

  return category;
}

async function countProgramsInCategory(categoryId: string) {
  const [row] = await db
    .select({ count: count() })
    .from(programs)
    .where(eq(programs.categoryId, categoryId));

  return row?.count ?? 0;
}

/* =========================================================
   ROUTER
========================================================= */

export const categoryRouter = createTRPCRouter({
  getFiltered: protectedProcedure
    .input(categoryFilterSchema)
    .query(async ({ input }): Promise<FilteredCategory[]> => {
      const conditions: SQL[] = [];

      if (input.status) {
        conditions.push(eq(programCategories.status, input.status));
      }
      if (input.searchQuery) {
        conditions.push(ilike(programCategories.label, `%${input.searchQuery}%`));
      }

      return db
        .select({
          id: programCategories.id,
          slug: programCategories.slug,
          label: programCategories.label,
          shortLabel: programCategories.shortLabel,
          status: programCategories.status,
          icon: programCategories.icon,
          heroImage: programCategories.heroImage,
          themePrimary: programCategories.themePrimary,
          tagline: programCategories.tagline,
          description: programCategories.description,
          order: programCategories.order,
          createdAt: programCategories.createdAt,
          updatedAt: programCategories.updatedAt,
          // count(programs.id) counts only matched (non-null) rows → 0 when none.
          programCount: count(programs.id),
        })
        .from(programCategories)
        .leftJoin(programs, eq(programs.categoryId, programCategories.id))
        .where(conditions.length ? and(...conditions) : undefined)
        // Grouping by the PK lets Postgres select the other category columns.
        .groupBy(programCategories.id)
        .orderBy(asc(programCategories.order));
    }),

  getById: protectedProcedure.input(idInput).query(async ({ input }) => {
    const category = await fetchCategory(input.id);
    const programCount = await countProgramsInCategory(input.id);
    return { ...category, programCount };
  }),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const category = await db.query.programCategories.findFirst({
        where: eq(programCategories.slug, input.slug),
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kategori tidak ditemukan",
        });
      }

      return category;
    }),

  getUniqueSlug: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        excludeId: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const slug = await generateUniqueSlug({
        table: programCategories,
        slugColumn: programCategories.slug,
        idColumn: programCategories.id,
        title: input.title,
        excludeId: input.excludeId,
      });

      return { slug };
    }),

  create: protectedProcedure
    .input(categoryInsertSchema)
    .mutation(async ({ input }) => {
      const { order: _ignoredOrder, slug: inputSlug, ...values } = input;

      const slug = await generateUniqueSlug({
        table: programCategories,
        slugColumn: programCategories.slug,
        title: inputSlug || input.label,
      });

      const order = await getNextOrder({
        table: programCategories,
        orderColumn: programCategories.order,
      });

      const [row] = await db
        .insert(programCategories)
        .values({
          ...values,
          id: crypto.randomUUID(),
          slug,
          order,
        })
        .returning();

      return row;
    }),

  update: protectedProcedure
    .input(categoryUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, slug, ...rest } = input;

      // Regenerate the slug only when the admin explicitly changed it or the
      // label (if a slug string was provided we use it, else fall back to label).
      const slugSource = slug || rest.label;
      const nextSlug = slugSource
        ? await generateUniqueSlug({
            table: programCategories,
            slugColumn: programCategories.slug,
            idColumn: programCategories.id,
            title: slugSource,
            excludeId: id,
          })
        : undefined;

      const [row] = await db
        .update(programCategories)
        .set({
          ...rest,
          ...(nextSlug ? { slug: nextSlug } : {}),
        })
        .where(eq(programCategories.id, id))
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kategori tidak ditemukan",
        });
      }

      return row;
    }),

  setStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        status: categoryInsertSchema.shape.status,
      }),
    )
    .mutation(async ({ input }) => {
      const [row] = await db
        .update(programCategories)
        .set({ status: input.status })
        .where(eq(programCategories.id, input.id))
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kategori tidak ditemukan",
        });
      }

      return row;
    }),

  move: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        direction: z.enum(["up", "down"]),
      }),
    )
    .mutation(async ({ input }) => {
      const all = await db
        .select({
          id: programCategories.id,
          order: programCategories.order,
        })
        .from(programCategories)
        .orderBy(asc(programCategories.order));

      const index = all.findIndex((c) => c.id === input.id);
      if (index === -1) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kategori tidak ditemukan",
        });
      }

      const targetIndex = input.direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= all.length) {
        return { success: true };
      }

      const current = all[index];
      const target = all[targetIndex];

      // Swap order values (coalesce nulls to the array position as a fallback).
      const currentOrder = current.order ?? index;
      const targetOrder = target.order ?? targetIndex;

      await db
        .update(programCategories)
        .set({ order: targetOrder })
        .where(eq(programCategories.id, current.id));
      await db
        .update(programCategories)
        .set({ order: currentOrder })
        .where(eq(programCategories.id, target.id));

      return { success: true };
    }),

  remove: protectedProcedure.input(idInput).mutation(async ({ input }) => {
    // Guard: programs.categoryId is ON DELETE CASCADE, so deleting a category
    // with programs would wipe those programs. Refuse instead.
    const count = await countProgramsInCategory(input.id);

    if (count > 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Kategori masih memiliki ${count} program. Pindahkan atau hapus program tersebut terlebih dahulu.`,
      });
    }

    await db.delete(programCategories).where(eq(programCategories.id, input.id));
    return { success: true };
  }),
});