import {
  BatchSnap,
  CategorySnap,
  ProgramSnap,
  RegisterContext,
} from "@/app/(home)/register/client";
import { db } from "@/app/db/db";
import { programBatches, programCategories } from "@/app/db/schema";
import { baseProcedure, createTRPCRouter } from "@/lib/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, InferSelectModel } from "drizzle-orm";
import z from "zod";

type Category = InferSelectModel<typeof programCategories>;

type Batch = InferSelectModel<typeof programBatches>;

type ProgramWithRelations = Awaited<
  ReturnType<
    typeof db.query.programs.findFirst<{
      with: {
        category: true;
        batches: true;
      };
    }>
  >
>;

export const programRouter = createTRPCRouter({
  getAll: baseProcedure.query(() => {
    return [];
  }),
  getCategories: baseProcedure.query(async () => {
    const categories = await db
      .select({
        id: programCategories.id,
        icon: programCategories.icon,
        label: programCategories.label,
      })
      .from(programCategories)
      .orderBy(asc(programCategories.label));
    return categories;
  }),
  getProgramPage: baseProcedure
    .input(
      z.object({
        categorySlug: z.string(),
        programSlug: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const result = await db.query.programs.findFirst({
        where: (programs) => eq(programs.slug, input.programSlug),

        with: {
          category: true,

          batches: {
            where: (batches) =>
              and(eq(batches.isOpen, true), eq(batches.status, "open")),
          },
        },
      });

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (result.category.slug !== input.categorySlug) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return result;
    }),
  getRegisterContext: baseProcedure
    .input(
      z.object({
        categorySlug: z.string().optional(),
        programSlug: z.string().optional(),
        batchSlug: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const warnings: string[] = [];

      /**
       * Lightweight selected entities only.
       * Avoid returning massive CMS payloads.
       */

      let category: CategorySnap | null = null;
      let program: ProgramSnap | null = null;
      let batch: BatchSnap | null = null;

      // ─────────────────────────────────────────────────────────────
      // CATEGORY
      // ─────────────────────────────────────────────────────────────

      if (input.categorySlug) {
        const foundCategory = await db.query.programCategories.findFirst({
          where: (categories) => eq(categories.slug, input.categorySlug!),

          columns: {
            id: true,
            slug: true,
            label: true,
            shortLabel: true,
            themePrimary: true,
            icon: true,
          },
        });

        if (!foundCategory) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });
        }

        category = foundCategory;
      }

      // ─────────────────────────────────────────────────────────────
      // PROGRAM
      // ─────────────────────────────────────────────────────────────

      if (input.programSlug) {
        const foundProgram = await db.query.programs.findFirst({
          where: (programs) => eq(programs.slug, input.programSlug!),

          columns: {
            id: true,
            slug: true,
            title: true,
            shortDesc: true,
            thumbnail: true,
            registrationType: true,
            categoryId: true,
            level: true,
            format: true,
          },
        });

        if (!foundProgram) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Program not found",
          });
        }

        /**
         * Validate category-program relation
         */
        if (category && foundProgram.categoryId !== category.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Program does not belong to category",
          });
        }

        program = foundProgram;

        /**
         * Auto-fill category from selected program
         */
        if (!category) {
          const relatedCategory = await db.query.programCategories.findFirst({
            where: (categories) => eq(categories.id, foundProgram.categoryId),

            columns: {
              id: true,
              slug: true,
              label: true,
              shortLabel: true,
              themePrimary: true,
              icon: true,
            },
          });

          category = relatedCategory ?? null;
        }
      }

      // ─────────────────────────────────────────────────────────────
      // BATCH
      // ─────────────────────────────────────────────────────────────

      if (input.batchSlug) {
        const foundBatch = await db.query.programBatches.findFirst({
          where: (batches) =>
            and(
              eq(batches.slug, input.batchSlug!),
              eq(batches.isOpen, true),
              eq(batches.status, "open"),
            ),

          columns: {
            id: true,
            slug: true,
            title: true,

            type: true,

            startDate: true,
            endDate: true,

            capacity: true,
            enrolledCount: true,
            isUnlimited: true,

            mode: true,
            location: true,
            meetingTime: true,

            price: true,
            originalPrice: true,

            programId: true,
          },
        });

        /**
         * Invalid batch should not fail page rendering.
         */
        if (!foundBatch) {
          warnings.push("Selected batch is no longer available");
        }

        if (foundBatch) {
          /**
           * Validate batch-program relation
           */
          if (program && foundBatch.programId !== program.id) {
            warnings.push("Selected batch does not belong to selected program");
          } else {
            batch = {
              id: foundBatch.id,
              slug: foundBatch.slug,
              title: foundBatch.title,

              type: foundBatch.type,

              startDate: foundBatch.startDate,
              endDate: foundBatch.endDate,

              capacity: foundBatch.capacity,
              enrolledCount: foundBatch.enrolledCount,
              isUnlimited: foundBatch.isUnlimited,

              mode: foundBatch.mode,
              location: foundBatch.location,
              meetingTime: foundBatch.meetingTime,

              price: foundBatch.price,
              originalPrice: foundBatch.originalPrice,
            };
          }

          /**
           * Auto-fill program from selected batch
           */
          if (!program) {
            const relatedProgram = await db.query.programs.findFirst({
              where: (programs) => eq(programs.id, foundBatch.programId),

              columns: {
                id: true,
                slug: true,
                title: true,
                shortDesc: true,
                thumbnail: true,
                registrationType: true,
                categoryId: true,
                level: true,
                format: true,
              },
            });

            if (relatedProgram) {
              program = relatedProgram;

              /**
               * Auto-fill category from related program
               */
              if (!category) {
                const relatedCategory =
                  await db.query.programCategories.findFirst({
                    where: (categories) =>
                      eq(categories.id, relatedProgram.categoryId),

                    columns: {
                      id: true,
                      slug: true,
                      label: true,
                      shortLabel: true,
                      themePrimary: true,
                      icon: true,
                    },
                  });

                category = relatedCategory ?? null;
              }
            }
          }
        }
      }

      const result: RegisterContext = {
        category,
        program,
        batch,
        warnings,

        selected: {
          categoryId: category?.id ?? null,
          programId: program?.id ?? null,
          batchId: batch?.id ?? null,
        },
      };

      return result;
    }),
  getRegisterCategories: baseProcedure.query(async () => {
    const categories = await db.query.programCategories.findMany({
      where: (categories, { eq }) => eq(categories.status, "published"),

      orderBy: (categories, { asc }) => [
        asc(categories.order),
        asc(categories.label),
      ],

      columns: {
        id: true,
        slug: true,
        label: true,
        shortLabel: true,
        icon: true,
        themePrimary: true,
      },
    });

    return categories;
  }),
  getProgramsForRegister: baseProcedure
    .input(
      z.object({
        categoryId: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.categoryId) {
        return [];
      }

      const programs = await db.query.programs.findMany({
        where: (programs, { eq, and }) =>
          and(
            eq(programs.categoryId, input.categoryId!),
            eq(programs.status, "published"),
          ),

        orderBy: (programs, { asc }) => [
          asc(programs.order),
          asc(programs.title),
        ],

        columns: {
          id: true,
          slug: true,
          title: true,
          shortDesc: true,
          thumbnail: true,
          registrationType: true,
          startingPrice: true,
          startingOriginalPrice: true,
          duration: true,
          level: true,
          badge: true,
          format: true,
        },
      });

      return programs;
    }),
  getProgramBatchesForRegister: baseProcedure
    .input(
      z.object({
        programId: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.programId) {
        return [];
      }

      const batches = await db.query.programBatches.findMany({
        where: (batches, { eq, and }) =>
          and(
            eq(batches.programId, input.programId!),
            eq(batches.isOpen, true),
            eq(batches.status, "open"),
          ),

        orderBy: (batches, { asc }) => [asc(batches.startDate)],

        columns: {
          id: true,
          slug: true,
          title: true,
          type: true,
          startDate: true,
          endDate: true,
          mode: true,
          capacity: true,
          isUnlimited: true,
          originalPrice: true,
          price: true,
          enrolledCount: true,
          location: true,
          meetingTime: true,
        },
      });

      return batches;
    }),
});
