import {
  BatchSnap,
  CategorySnap,
  PackageItem,
  ProgramSnap,
  RegisterContext,
} from "@/app/(home)/register/client";
import { db } from "@/app/db/db";
import {
  programBatches,
  programCategories,
  programContent,
  programFormatEnum,
  programLevelEnum,
  programPackages,
  programs,
  programScheduleTypeEnum,
  programStatusEnum,
  registrationTypeEnum,
  user,
} from "@/app/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/lib/trpc/init";
import {
  batchCreateSchema,
  batchUpdateSchema,
  packageCreateSchema,
  packageUpdateSchema,
  programBrandingUpdateSchema,
  programCreateSchema,
  programIdentityUpdateSchema,
  programMarketingUpdateSchema,
  programStatusUpdateSchema,
  programStructureUpdateSchema,
  programUpdateSchema,
} from "@/lib/zodSchemas";
import { TRPCError } from "@trpc/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  InferSelectModel,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import z from "zod";
import { generateUniqueSlug, getNextOrder } from "./program.slug";
import { nanoid } from "nanoid";
import { requireRole } from "@/lib/auth/roles";
import { RouterOutputs } from "@/lib/trpc/react";
import { DetailData } from "@/app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/detail";
import { generateSlug } from "@/lib/utils";
import { UTApi } from "uploadthing/server";

const CATEGORY_COLS = {
  id: true,
  slug: true,
  label: true,
  shortLabel: true,
  themePrimary: true,
  icon: true,
} as const;

const PROGRAM_COLS = {
  id: true,
  slug: true,
  title: true,
  shortDesc: true,
  thumbnailUrl: true,
  registrationType: true,
  categoryId: true,
  level: true,
  format: true,
  // ★ needed to branch permanent vs scheduled flow
  scheduleType: true,
} as const;

const BATCH_COLS = {
  id: true,
  slug: true,
  title: true,
  startDate: true,
  endDate: true,
  mode: true,
  location: true,
  schedules: true,
  capacity: true,
  enrolledCount: true,
  programId: true,
} as const;

const PACKAGE_COLS = {
  id: true,
  title: true,
  slug: true,
  description: true,
  price: true,
  originalPrice: true,
  isDefault: true,
  order: true,
} as const;

async function fetchBatchPackages(batchId: string): Promise<PackageItem[]> {
  return db.query.programPackages.findMany({
    where: (pkg) => eq(pkg.batchId, batchId),
    columns: PACKAGE_COLS,
    orderBy: (pkg, { asc }) => [asc(pkg.order), asc(pkg.price)],
  });
}

async function fetchProgramPackages(programId: string) {
  return db.query.programPackages.findMany({
    where: and(
      eq(programPackages.programId, programId),
      // batchId IS NULL — these are the direct program packages
      // Drizzle: use isNull helper
    ),
    columns: PACKAGE_COLS,
    orderBy: (pkg, { asc }) => [asc(pkg.order), asc(pkg.price)],
  });
}

async function deriveStartingPrice(programId: string): Promise<{
  startingPrice: number | null;
  startingOriginalPrice: number | null;
}> {
  const pkgs = await db.query.programPackages.findMany({
    where: eq(programPackages.programId, programId),
    columns: { price: true, originalPrice: true, batchId: true },
  });

  if (pkgs.length === 0) {
    return { startingPrice: null, startingOriginalPrice: null };
  }

  // Prefer global packages for the display price
  const globals = pkgs.filter((p) => p.batchId == null);
  const candidates = globals.length > 0 ? globals : pkgs;

  const sorted = [...candidates].sort((a, b) => a.price - b.price);
  const cheapest = sorted[0]!;

  return {
    startingPrice: cheapest.price,
    startingOriginalPrice: cheapest.originalPrice ?? null,
  };
}

async function syncStartingPrice(programId: string) {
  const prices = await deriveStartingPrice(programId);
  await db
    .update(programs)
    .set({
      startingPrice: prices.startingPrice,
      startingOriginalPrice: prices.startingOriginalPrice,
    })
    .where(eq(programs.id, programId));
}

export const programRouter = createTRPCRouter({
  getAll: baseProcedure.query(async () => {
    const result = await db
      .select()
      .from(programs)
      .orderBy(asc(programs.title));
    return result;
  }),
  getUniqueSlug: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        // optional for create page
        excludeId: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const slug = await generateUniqueSlug({
        table: programs,
        slugColumn: programs.slug,
        idColumn: programs.id,
        title: input.title,
        excludeId: input.excludeId,
      });

      return {
        slug,
      };
    }),
  getById: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const program = await db.query.programs.findFirst({
        where: eq(programs.id, input.id),
        with: {
          batches: {
            orderBy: [asc(programBatches.startDate)],
            with: {
              packages: {
                orderBy: [asc(programPackages.order)],
              },
            },
          },
          packages: {
            // global packages (batchId IS NULL)
            where: isNull(programPackages.batchId),
            orderBy: [asc(programPackages.order)],
          },
        },
      });

      if (!program) throw new TRPCError({ code: "NOT_FOUND" });
      return program;
    }),
  getBySlug: baseProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const program = await db.query.programs.findFirst({
        where: eq(programs.slug, input.slug),
        with: {
          category: { columns: { id: true, label: true, icon: true } },
          batches: {
            where: eq(programBatches.status, "open"),
            orderBy: [asc(programBatches.startDate)],
            with: {
              packages: {
                orderBy: [asc(programPackages.order)],
              },
            },
          },
          packages: {
            where: isNull(programPackages.batchId),
            orderBy: [asc(programPackages.order)],
          },
        },
      });

      if (!program) throw new TRPCError({ code: "NOT_FOUND" });
      return program;
    }),
  list: protectedProcedure
    .input(
      z.object({
        categoryId: z.string().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      }),
    )
    .query(async ({ input }) => {
      const conditions = [];
      if (input.categoryId)
        conditions.push(eq(programs.categoryId, input.categoryId));
      if (input.status) conditions.push(eq(programs.status, input.status));

      return db.query.programs.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: [asc(programs.order), desc(programs.createdAt)],
        limit: input.limit,
        offset: input.offset,
        columns: {
          id: true,
          title: true,
          slug: true,
          status: true,
          format: true,
          level: true,
          startingPrice: true,
          startingOriginalPrice: true,
          thumbnailUrl: true,
          badge: true,
          createdAt: true,
        },
        with: {
          category: { columns: { id: true, label: true } },
        },
      });
    }),

  getCategories: baseProcedure.query(async () => {
    const categories = await db
      .select()
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
            where: (batches) => eq(batches.status, "open"),
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
        packageSlug: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const warnings: string[] = [];

      let category: CategorySnap | null = null;
      let program: ProgramSnap | null = null;
      let batch: BatchSnap | null = null;

      let selectedPackageId: string | null = null;

      // ─────────────────────────────────────────────────────────────
      // CATEGORY
      // ─────────────────────────────────────────────────────────────

      if (input.categorySlug) {
        const found = await db.query.programCategories.findFirst({
          where: (c) => eq(c.slug, input.categorySlug!),
          columns: CATEGORY_COLS,
        });

        if (!found) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });
        }

        category = found;
      }

      // ─────────────────────────────────────────────────────────────
      // PROGRAM
      // ─────────────────────────────────────────────────────────────

      if (input.programSlug) {
        const found = await db.query.programs.findFirst({
          where: (p) => eq(p.slug, input.programSlug!),
          columns: PROGRAM_COLS,
        });

        if (!found) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Program not found",
          });
        }

        // Validate category ownership
        if (category && found.categoryId !== category.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Program does not belong to category",
          });
        }

        program = found;

        // Auto-fill category from program
        if (!category) {
          const relatedCategory = await db.query.programCategories.findFirst({
            where: (c) => eq(c.id, found.categoryId),
            columns: CATEGORY_COLS,
          });

          category = relatedCategory ?? null;
        }
      }

      // ─────────────────────────────────────────────────────────────
      // BATCH
      // ─────────────────────────────────────────────────────────────

      if (input.batchSlug) {
        const found = await db.query.programBatches.findFirst({
          where: (b) => and(eq(b.slug, input.batchSlug!), eq(b.status, "open")),

          columns: BATCH_COLS,
        });

        if (!found) {
          warnings.push("Selected batch is no longer available");
        } else {
          // Validate program ownership
          if (program && found.programId !== program.id) {
            warnings.push("Selected batch does not belong to selected program");
          } else {
            // Fetch batch packages
            const packages = await fetchBatchPackages(found.id);

            batch = {
              id: found.id,
              slug: found.slug,
              title: found.title,
              startDate: found.startDate,
              endDate: found.endDate,
              mode: found.mode,
              location: found.location,
              schedules: found.schedules,
              capacity: found.capacity,
              enrolledCount: found.enrolledCount,
              packages,
            };
          }

          // Auto-fill program from batch
          if (!program) {
            const relatedProgram = await db.query.programs.findFirst({
              where: (p) => eq(p.id, found.programId),
              columns: PROGRAM_COLS,
            });

            if (relatedProgram) {
              program = relatedProgram;

              // Auto-fill category from program
              if (!category) {
                const relatedCategory =
                  await db.query.programCategories.findFirst({
                    where: (c) => eq(c.id, relatedProgram.categoryId),
                    columns: CATEGORY_COLS,
                  });

                category = relatedCategory ?? null;
              }
            }
          }
        }
      }

      // ─────────────────────────────────────────────────────────────
      // PROGRAM PACKAGES
      // ─────────────────────────────────────────────────────────────

      let programPackageItems: PackageItem[] = [];

      if (program) {
        programPackageItems = await fetchProgramPackages(program.id);
      }

      // ─────────────────────────────────────────────────────────────
      // PACKAGE
      // ─────────────────────────────────────────────────────────────

      if (input.packageSlug) {
        const foundPackage = await db.query.programPackages.findFirst({
          where: (p) => eq(p.slug, input.packageSlug!),

          columns: {
            id: true,
            slug: true,
            programId: true,
            batchId: true,
          },
        });

        if (!foundPackage) {
          warnings.push("Selected package is no longer available");
        } else {
          // Validate against selected program
          if (program && foundPackage.programId !== program.id) {
            warnings.push(
              "Selected package does not belong to selected program",
            );
          } else {
            // Validate against selected batch
            if (
              batch &&
              foundPackage.batchId &&
              foundPackage.batchId !== batch.id
            ) {
              warnings.push(
                "Selected package does not belong to selected batch",
              );
            } else {
              selectedPackageId = foundPackage.id;
            }
          }
        }
      }

      const result: RegisterContext = {
        category,

        program,

        programPackages: programPackageItems,

        batch,

        warnings,

        selected: {
          categoryId: category?.id ?? null,
          programId: program?.id ?? null,
          batchId: batch?.id ?? null,
          packageId: selectedPackageId,
        },
      };

      return result;
    }),
  getRegisterCategories: baseProcedure.query(async () => {
    return db.query.programCategories.findMany({
      where: (c, { eq }) => eq(c.status, "published"),
      orderBy: (c, { asc }) => [asc(c.order), asc(c.label)],
      columns: CATEGORY_COLS,
    });
  }),
  getProgramsForRegister: baseProcedure
    .input(z.object({ categoryId: z.string().optional() }))
    .query(async ({ input }) => {
      if (!input.categoryId) return [];

      return db.query.programs.findMany({
        where: (p, { eq, and }) =>
          and(eq(p.categoryId, input.categoryId!), eq(p.status, "published")),
        orderBy: (p, { asc }) => [asc(p.order), asc(p.title)],
        columns: {
          id: true,
          slug: true,
          title: true,
          shortDesc: true,
          thumbnailUrl: true,
          registrationType: true,
          startingPrice: true,
          startingOriginalPrice: true,
          duration: true,
          level: true,
          badge: true,
          format: true,
          scheduleType: true,
        },
      });
    }),
  getProgramPackagesForRegister: baseProcedure
    .input(z.object({ programId: z.string().optional() }))
    .query(async ({ input }) => {
      if (!input.programId) return [];
      return fetchProgramPackages(input.programId);
    }),
  getProgramBatchesForRegister: baseProcedure
    .input(z.object({ programId: z.string().optional() }))
    .query(async ({ input }) => {
      if (!input.programId) return [];

      const batches = await db.query.programBatches.findMany({
        where: (b, { eq, and }) =>
          and(eq(b.programId, input.programId!), eq(b.status, "open")),
        orderBy: (b, { asc }) => [asc(b.startDate)],
        columns: BATCH_COLS,
        with: {
          // Drizzle relation — make sure programBatchRelations includes packages
          packages: {
            columns: PACKAGE_COLS,
            orderBy: (pkg, { asc }) => [asc(pkg.order), asc(pkg.price)],
          },
        },
      });

      return batches;
    }),

  // ── Program Mutations ──────────────────────────────────────────────────────

  /**
   * Step 1: Create the program shell.
   * No batches or packages are created here.
   * startingPrice stays null until packages are added.
   */
  createProgram: protectedProcedure
    .input(programCreateSchema)
    .mutation(async ({ input }) => {
      // ── Validate category ───────────────────────────────────────────────────
      const category = await db.query.programCategories.findFirst({
        where: eq(programCategories.id, input.categoryId),
        columns: { id: true },
      });
      if (!category) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kategori program tidak ditemukan",
        });
      }

      // ── Generate unique slug ────────────────────────────────────────────────
      const slug = await generateUniqueSlug({
        table: programs,
        slugColumn: programs.slug,
        title: input.title,
      });

      const programId = nanoid(16);

      const nextOrder = await getNextOrder({
        table: programs,
        orderColumn: programs.order,
      });

      // ── Insert program shell ────────────────────────────────────────────────
      // startingPrice and startingOriginalPrice are intentionally null here.
      // They are derived and synced once packages are added via createPackage
      // or createBatch (on the /edit page).
      await db.insert(programs).values({
        id: programId,
        title: input.title,
        slug,
        description: input.description,
        shortDesc: input.shortDesc ?? null,
        categoryId: input.categoryId,
        scheduleType: input.scheduleType ?? "permanent",
        status: input.status ?? "draft",
        registrationType: input.registrationType ?? "online",
        format: input.format ?? "online",
        level: input.level ?? "beginner",
        order: nextOrder,
        badge: input.badge ?? null,
        highlight: input.highlight ?? null,
        tags: input.tags ?? [],
        duration: input.duration ?? null,

        icon: input.icon || null,
        startingPrice: null,
        startingOriginalPrice: null,
      });

      return { id: programId, slug };
    }),

  /** Update program content/marketing fields. */
  updateProgram: protectedProcedure
    .input(programUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      const existing = await db.query.programs.findFirst({
        where: eq(programs.id, id),
        columns: { id: true, slug: true, title: true },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      // Re-generate slug only if title changed
      let slug = existing.slug;
      if (data.title && data.title !== existing.title) {
        slug = await generateUniqueSlug({
          table: programs,
          slugColumn: programs.slug,
          title: data.title,
          excludeId: id,
        });
      }

      await db
        .update(programs)
        .set({ ...data, slug, updatedAt: new Date() })
        .where(eq(programs.id, id));

      return { id, slug };
    }),
  updateIdentity: protectedProcedure
    .input(programIdentityUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, slug: clientSlug, title, ...rest } = input;

      // 1. Load existing record
      const existing = await db.query.programs.findFirst({
        where: eq(programs.id, id),
        columns: {
          id: true,
          title: true,
          slug: true,
          categoryId: true,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan.",
        });
      }

      // 2. Determine the final slug
      let finalSlug: string;

      const titleChanged = title !== existing.title;
      const clientChangedSlug = clientSlug !== existing.slug;
      const autoSlugFromOldTitle = generateSlug(existing.title);

      if (clientChangedSlug) {
        // User explicitly edited the slug field — honour it but ensure uniqueness
        finalSlug = await generateUniqueSlug({
          table: programs,
          slugColumn: programs.slug,
          idColumn: programs.id,
          // Use the client-provided slug as the base so uniqueness check
          // only appends a counter if truly needed
          title: clientSlug, // generateUniqueSlug calls generateSlug internally
          excludeId: id,
        });
      } else if (titleChanged && existing.slug === autoSlugFromOldTitle) {
        // Title changed AND slug was still auto-derived from old title
        // → regenerate from new title
        finalSlug = await generateUniqueSlug({
          table: programs,
          slugColumn: programs.slug,
          idColumn: programs.id,
          title,
          excludeId: id,
        });
      } else {
        // Title unchanged, or slug was already custom — keep current slug
        finalSlug = existing.slug;
      }

      // 3. Persist
      await db
        .update(programs)
        .set({
          title,
          slug: finalSlug,
          shortDesc: rest.shortDesc ?? null,
          description: rest.description,
          categoryId: rest.categoryId,
          updatedAt: new Date(),
        })
        .where(eq(programs.id, id));

      return { id, slug: finalSlug };
    }),
  updateStructure: protectedProcedure
    .input(programStructureUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, scheduleType, registrationType, format, level, duration } =
        input;

      // 1. Load the current record
      const existing = await db.query.programs.findFirst({
        where: eq(programs.id, id),
        columns: {
          id: true,
          scheduleType: true,
        },
        // Pull counts we need for the lock check
        with: {
          packages: { columns: { id: true } },
          // enrollments: { columns: { id: true } },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan.",
        });
      }

      // 2. Schedule-type lock guard
      // const isLocked =
      //   (existing.packages?.length ?? 0) > 0 ||
      //   (existing.enrollments?.length ?? 0) > 0;

      const isLocked = false;

      if (isLocked && scheduleType !== existing.scheduleType) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Tipe jadwal tidak dapat diubah karena program sudah memiliki paket atau pendaftar.",
        });
      }

      // 3. Persist
      await db
        .update(programs)
        .set({
          scheduleType,
          registrationType,
          format,
          level,
          duration: duration ?? null,
          updatedAt: new Date(),
        })
        .where(eq(programs.id, id));

      return { id };
    }),
  updateMarketing: protectedProcedure
    .input(programMarketingUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, badge, highlight, tags } = input;

      const existing = await db.query.programs.findFirst({
        where: eq(programs.id, id),
        columns: { id: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan.",
        });
      }

      await db
        .update(programs)
        .set({
          badge: badge || null,
          highlight: highlight || null,
          tags: tags.length ? tags : null,
          updatedAt: new Date(),
        })
        .where(eq(programs.id, id));

      return { id };
    }),
  updateBranding: protectedProcedure
    .input(programBrandingUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, icon, thumbnailUrl } = input;

      const existing = await db.query.programs.findFirst({
        where: eq(programs.id, id),
        columns: { id: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan.",
        });
      }

      await db
        .update(programs)
        .set({
          icon: icon || null,
          thumbnailUrl: thumbnailUrl || null,
          updatedAt: new Date(),
        })
        .where(eq(programs.id, id));

      return { id };
    }),
  updateStatus: protectedProcedure
    .input(programStatusUpdateSchema)
    .mutation(async ({ input }) => {
      const existing = await db.query.programs.findFirst({
        where: eq(programs.id, input.id),
        columns: { id: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan.",
        });
      }

      await db
        .update(programs)
        .set({
          status: input.status ?? null,
          updatedAt: new Date(),
        })
        .where(eq(programs.id, input.id));

      return { id: input.id };
    }),
  removeThumbnail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const existing = await db.query.programs.findFirst({
        where: eq(programs.id, input.id),
        columns: { id: true, thumbnailKey: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program tidak ditemukan.",
        });
      }

      // Delete from UploadThing only if a key exists
      if (existing.thumbnailKey) {
        const utapi = new UTApi();
        await utapi.deleteFiles(existing.thumbnailKey);
      }

      await db
        .update(programs)
        .set({
          thumbnailUrl: null,
          thumbnailKey: null,
          updatedAt: new Date(),
        })
        .where(eq(programs.id, input.id));

      return { id: input.id };
    }),

  deleteProgram: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(programs).where(eq(programs.id, input.id));
      return { id: input.id };
    }),

  // ── Batch Mutations ────────────────────────────────────────────────────────

  /**
   * Create a batch for a program.
   * If packages are provided, they are created as batch-specific packages.
   */
  createBatch: protectedProcedure
    .input(
      batchCreateSchema.extend({
        programId: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const program = await db.query.programs.findFirst({
        where: eq(programs.id, input.programId),
        columns: { id: true, slug: true, format: true },
      });
      if (!program) throw new TRPCError({ code: "NOT_FOUND" });

      const batchId = nanoid(16);
      const batchSlug = await generateUniqueSlug({
        table: programBatches,
        slugColumn: programBatches.slug,
        title: `${program.slug}-${input.title}`,
      });

      await db.insert(programBatches).values({
        id: batchId,
        programId: input.programId,
        title: input.title,
        slug: batchSlug,
        status: input.status,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        capacity: input.capacity ?? null,
        mode:
          input.mode ?? (program.format === "offline" ? "offline" : "online"),
        location: input.location ?? null,
        schedules: input.schedules ?? null,
        notes: input.notes ?? null,
        teacherId: input.teacherId ?? null,
      });

      // Create batch-specific packages if provided
      if (input.packages && input.packages.length > 0) {
        const packageValues = await Promise.all(
          input.packages.map(async (pkg, idx) => ({
            id: nanoid(16),
            programId: input.programId,
            batchId,
            title: pkg.title,
            slug: await generateUniqueSlug({
              table: programPackages,
              slugColumn: programPackages.slug,
              title: `${batchSlug}-${pkg.title}`,
            }),
            description: pkg.description ?? null,
            price: pkg.price,
            originalPrice: pkg.originalPrice ?? null,
            isDefault: pkg.isDefault,
            order: idx,
          })),
        );

        await db.insert(programPackages).values(packageValues);
        await syncStartingPrice(input.programId);
      }

      return { id: batchId, slug: batchSlug };
    }),

  updateBatch: protectedProcedure
    .input(batchUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, packages, ...data } = input;
      const { startDate, endDate, registrationDeadline, ...rest } = data;

      await db
        .update(programBatches)
        .set({
          ...rest,

          startDate:
            startDate === undefined
              ? undefined
              : startDate === null
                ? null
                : new Date(startDate),

          endDate:
            endDate === undefined
              ? undefined
              : endDate === null
                ? null
                : new Date(endDate),

          registrationDeadline:
            registrationDeadline === undefined
              ? undefined
              : registrationDeadline === null
                ? null
                : new Date(registrationDeadline),

          updatedAt: new Date(),
        })
        .where(eq(programBatches.id, id));

      return { id };
    }),

  deleteBatch: protectedProcedure
    .input(z.object({ id: z.string(), programId: z.string() }))
    .mutation(async ({ input }) => {
      // Cascade deletes batch packages via FK
      await db.delete(programBatches).where(eq(programBatches.id, input.id));
      await syncStartingPrice(input.programId);
      return { id: input.id };
    }),

  // ── Package Mutations ──────────────────────────────────────────────────────

  /**
   * Create a package.
   * - batchId = null  → global program package
   * - batchId = "..."  → batch-specific package
   */
  createPackage: protectedProcedure
    .input(packageCreateSchema)
    .mutation(async ({ input }) => {
      const program = await db.query.programs.findFirst({
        where: eq(programs.id, input.programId),
        columns: { id: true, slug: true },
      });
      if (!program) throw new TRPCError({ code: "NOT_FOUND" });

      if (input.batchId) {
        const batch = await db.query.programBatches.findFirst({
          where: and(
            eq(programBatches.id, input.batchId),
            eq(programBatches.programId, input.programId),
          ),
          columns: { id: true },
        });
        if (!batch)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Batch not found or does not belong to this program",
          });
      }

      const packageId = nanoid(16);
      const scope = input.batchId ? input.batchId : program.slug;
      const slug = await generateUniqueSlug({
        table: programPackages,
        slugColumn: programPackages.slug,
        title: `${scope}-${input.title}`,
      });
      const nextOrder = await getNextOrder({
        table: programs,
        orderColumn: programs.order,
      });
      await db.insert(programPackages).values({
        id: packageId,
        programId: input.programId,
        batchId: input.batchId ?? null,
        title: input.title,
        slug,
        description: input.description ?? null,
        price: input.price,
        originalPrice: input.originalPrice ?? null,
        isDefault: input.isDefault,
        order: nextOrder,
      });

      await syncStartingPrice(input.programId);
      return { id: packageId };
    }),

  updatePackage: protectedProcedure
    .input(packageUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, programId, batchId, ...data } = input;

      await db
        .update(programPackages)
        .set(data)
        .where(eq(programPackages.id, id));

      if (programId) await syncStartingPrice(programId);
      return { id };
    }),

  deletePackage: protectedProcedure
    .input(z.object({ id: z.string(), programId: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(programPackages).where(eq(programPackages.id, input.id));
      await syncStartingPrice(input.programId);
      return { id: input.id };
    }),

  /** Reorder packages within a program or batch. */
  reorderPackages: protectedProcedure
    .input(
      z.object({
        programId: z.string(),
        orderedIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      await Promise.all(
        input.orderedIds.map((pkgId, idx) =>
          db
            .update(programPackages)
            .set({ order: idx })
            .where(eq(programPackages.id, pkgId)),
        ),
      );
      return { success: true };
    }),

  // ── Registration queries ───────────────────────────────────────────────────

  /**
   * Resolve packages for a given program + optional batch.
   *
   * Logic:
   *  1. If batchId provided AND that batch has its own packages → return those
   *  2. Otherwise → return global program packages
   */
  resolvePackages: baseProcedure
    .input(
      z.object({
        programId: z.string(),
        batchId: z.string().optional().nullable(),
      }),
    )
    .query(async ({ input }) => {
      if (input.batchId) {
        const batchPackages = await db.query.programPackages.findMany({
          where: and(
            eq(programPackages.programId, input.programId),
            eq(programPackages.batchId, input.batchId),
          ),
          orderBy: [asc(programPackages.order)],
        });

        if (batchPackages.length > 0) {
          return { packages: batchPackages, scope: "batch" as const };
        }
      }

      // Fallback: global packages
      const globalPackages = await db.query.programPackages.findMany({
        where: and(
          eq(programPackages.programId, input.programId),
          isNull(programPackages.batchId),
        ),
        orderBy: [asc(programPackages.order)],
      });

      return { packages: globalPackages, scope: "global" as const };
    }),
  getFiltered: protectedProcedure
    .input(
      z.object({
        searchQuery: z.string().optional(),

        status: z.enum(programStatusEnum.enumValues).optional(),

        categoryId: z.string().optional(),

        format: z.enum(programFormatEnum.enumValues).optional(),

        level: z.enum(programLevelEnum.enumValues).optional(),

        scheduleType: z.enum(programScheduleTypeEnum.enumValues).optional(),

        registrationType: z.enum(registrationTypeEnum.enumValues).optional(),

        page: z.number().min(1).default(1),

        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const authUserId = ctx.session?.user.id!;
      console.log({
        userId: ctx.auth.userId,
        roles: ctx.auth.roles,
      });

      await requireRole({
        userId: ctx.auth.userId,
        roles: ctx.auth.roles,
        allowedRoles: ["admin", "super_admin"],
      });

      const {
        searchQuery,
        status,
        categoryId,
        format,
        level,
        scheduleType,
        registrationType,
        page,
        limit,
      } = input;

      const filters = and(
        status ? eq(programs.status, status) : undefined,

        categoryId ? eq(programs.categoryId, categoryId) : undefined,

        format ? eq(programs.format, format) : undefined,

        level ? eq(programs.level, level) : undefined,

        scheduleType ? eq(programs.scheduleType, scheduleType) : undefined,

        registrationType
          ? eq(programs.registrationType, registrationType)
          : undefined,

        searchQuery
          ? or(
              ilike(programs.title, `%${searchQuery}%`),

              ilike(programs.shortDesc, `%${searchQuery}%`),
            )
          : undefined,
      );

      const rows = await db
        .select({
          id: programs.id,

          title: programs.title,

          slug: programs.slug,

          thumbnailUrl: programs.thumbnailUrl,

          status: programs.status,

          level: programs.level,

          format: programs.format,

          scheduleType: programs.scheduleType,

          registrationType: programs.registrationType,

          startingPrice: programs.startingPrice,

          duration: programs.duration,

          createdAt: programs.createdAt,

          updatedAt: programs.updatedAt,

          category: {
            id: programCategories.id,

            label: programCategories.label,
          },

          batchCount: sql<number>`count(distinct ${programBatches.id})`,

          packageCount: sql<number>`count(distinct ${programPackages.id})`,
        })
        .from(programs)

        .leftJoin(
          programCategories,
          eq(programs.categoryId, programCategories.id),
        )

        .leftJoin(programBatches, eq(programs.id, programBatches.programId))

        .leftJoin(programPackages, eq(programs.id, programPackages.programId))

        .where(filters)

        .groupBy(programs.id, programCategories.id)

        .orderBy(
          sql`
          CASE
            WHEN ${programs.status} = 'published' THEN 0
            WHEN ${programs.status} = 'draft' THEN 1
            WHEN ${programs.status} = 'archived' THEN 2
            ELSE 3
          END
        `,

          asc(programs.order),

          desc(programs.updatedAt),

          asc(programs.title),
        )

        .limit(limit)

        .offset((page - 1) * limit);

      return rows;
    }),
  getDetailShell: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const program = await db.query.programs.findFirst({
        where: eq(programs.id, input.id),

        columns: {
          id: true,
          title: true,
          slug: true,
          shortDesc: true,
          status: true,

          scheduleType: true,
          registrationType: true,
          format: true,
          level: true,

          thumbnailUrl: true,
        },

        with: {
          category: {
            columns: {
              id: true,
              label: true,
              slug: true,
            },
          },
        },
      });

      if (!program) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      /* ========================================================
       COUNTS
    ======================================================== */

      const [batchesResult, packagesResult, contentResult] = await Promise.all([
        db
          .select({
            count: count(),
          })
          .from(programBatches)
          .where(eq(programBatches.programId, input.id)),

        db
          .select({
            count: count(),
          })
          .from(programPackages)
          .where(eq(programPackages.programId, input.id)),

        db.query.programContent.findFirst({
          where: eq(programContent.programId, input.id),
          columns: {
            sections: true,
          },
        }),
      ]);

      const batchesCount = batchesResult[0]?.count ?? 0;
      const packagesCount = packagesResult[0]?.count ?? 0;

      const contentSectionsCount = contentResult?.sections?.length ?? 0;

      return {
        ...program,

        stats: {
          batchesCount,
          packagesCount,

          // placeholder for future enrollment system
          enrollmentsCount: 0,

          contentSectionsCount,
        },

        features: {
          hasBatches: batchesCount > 0,
          hasPackages: packagesCount > 0,
          hasContent: contentSectionsCount > 0,
        },
      };
    }),
  getOverview: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const program = await db.query.programs.findFirst({
        where: eq(programs.id, input.id),

        columns: {
          id: true,

          title: true,
          slug: true,

          shortDesc: true,

          status: true,

          scheduleType: true,
          registrationType: true,

          format: true,
          level: true,

          duration: true,

          badge: true,
          highlight: true,

          startingPrice: true,
          startingOriginalPrice: true,

          thumbnailUrl: true,

          tags: true,

          publishedAt: true,
          updatedAt: true,
          createdAt: true,
        },

        with: {
          category: {
            columns: {
              id: true,
              label: true,
              slug: true,
            },
          },
        },
      });

      if (!program) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      const [batchesResult, openBatchesResult, packagesResult, contentResult] =
        await Promise.all([
          db
            .select({
              count: count(),
            })
            .from(programBatches)
            .where(eq(programBatches.programId, input.id)),

          db
            .select({
              count: count(),
            })
            .from(programBatches)
            .where(and(eq(programBatches.programId, input.id))),

          db
            .select({
              count: count(),
            })
            .from(programPackages)
            .where(eq(programPackages.programId, input.id)),

          db.query.programContent.findFirst({
            where: eq(programContent.programId, input.id),

            columns: {
              updatedAt: true,
              sections: true,
            },
          }),
        ]);

      const batchesCount = batchesResult[0]?.count ?? 0;

      const openBatchesCount = openBatchesResult[0]?.count ?? 0;

      const packagesCount = packagesResult[0]?.count ?? 0;

      const contentSectionsCount = contentResult?.sections?.length ?? 0;

      /* ======================================================
       HEALTH CHECKS
    ====================================================== */

      const issues: string[] = [];

      if (!program.thumbnailUrl) {
        issues.push("Program belum memiliki thumbnail");
      }

      if (!program.shortDesc) {
        issues.push("Short description belum diisi");
      }

      if (packagesCount === 0) {
        issues.push("Belum memiliki package");
      }

      if (program.scheduleType === "scheduled" && batchesCount === 0) {
        issues.push("Program scheduled belum memiliki batch");
      }

      if (contentSectionsCount === 0) {
        issues.push("Landing page content belum dibuat");
      }

      const completionScore = [
        !!program.thumbnailUrl,
        !!program.shortDesc,
        packagesCount > 0,
        contentSectionsCount > 0,
        program.scheduleType === "permanent" ? true : batchesCount > 0,
      ].filter(Boolean).length;

      const setupProgress = Math.round((completionScore / 5) * 100);

      /* ======================================================
       RETURN
    ====================================================== */

      return {
        identity: {
          id: program.id,

          title: program.title,
          slug: program.slug,

          shortDesc: program.shortDesc,

          thumbnailUrl: program.thumbnailUrl,

          category: program.category,

          badge: program.badge,
          highlight: program.highlight,

          status: program.status,
        },

        publishing: {
          status: program.status,

          publishedAt: program.publishedAt,

          publicUrl: `/programs/${program.category.slug}/${program.slug}`,
        },

        metrics: {
          batchesCount,
          openBatchesCount,

          packagesCount,

          contentSectionsCount,

          enrollmentsCount: 0,

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

          hasThumbnail: !!program.thumbnailUrl,

          hasContent: contentSectionsCount > 0,

          hasPackages: packagesCount > 0,

          hasBatches: batchesCount > 0,
        },

        activity: {
          updatedAt: program.updatedAt,

          contentUpdatedAt: contentResult?.updatedAt ?? null,

          createdAt: program.createdAt,
        },

        quickActions: {
          canPublish:
            packagesCount > 0 &&
            contentSectionsCount > 0 &&
            (program.scheduleType === "permanent" ? true : batchesCount > 0),

          canCreateBatch: program.scheduleType === "scheduled",

          canCreatePackage: true,

          canEditContent: true,
        },
      };
    }),
  getDetail: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }): Promise<DetailData> => {
      const program = await db.query.programs.findFirst({
        where: eq(programs.id, input.id),

        columns: {
          id: true,

          // Identity
          title: true,
          slug: true,

          description: true,
          shortDesc: true,

          categoryId: true,

          // Structure
          scheduleType: true,
          registrationType: true,

          format: true,
          level: true,

          duration: true,

          // Marketing
          badge: true,
          highlight: true,
          tags: true,

          // Branding
          thumbnailUrl: true,
          thumbnailKey: true,
          icon: true,

          // Publishing
          status: true,
          publishedAt: true,

          updatedAt: true,
          createdAt: true,

          // Commerce preview
          startingPrice: true,
          startingOriginalPrice: true,
        },

        with: {
          category: {
            columns: {
              id: true,
              label: true,
              slug: true,
              themePrimary: true,
              icon: true,
            },
          },
        },
      });

      if (!program) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program not found",
        });
      }

      /* ======================================================
       COUNTS & CAPABILITIES
    ====================================================== */

      const [packagesResult] = await Promise.all([
        db
          .select({
            count: count(),
          })
          .from(programPackages)
          .where(eq(programPackages.programId, input.id)),
      ]);

      const packagesCount = packagesResult[0]?.count ?? 0;

      // TODO:
      // Replace with real enrollment query later
      const enrollmentsCount = 0;

      /* ======================================================
       RETURN
    ====================================================== */

      return {
        id: program.id,

        // Identity
        title: program.title,
        slug: program.slug,

        description: program.description,
        shortDesc: program.shortDesc,

        categoryId: program.categoryId,

        category: {
          id: program.category.id,
          label: program.category.label,
          slug: program.category.slug,
          themePrimary: program.category.themePrimary,
          icon: program.category.icon,
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

        tags: program.tags ?? [],

        // Branding
        thumbnailUrl: program.thumbnailUrl,
        thumbnailKey: program.thumbnailKey,

        icon: program.icon,

        // Publishing
        status: program.status,

        publishedAt: program.publishedAt,

        updatedAt: program.updatedAt,

        createdAt: program.createdAt,

        // Commerce
        startingPrice: program.startingPrice,
        startingOriginalPrice: program.startingOriginalPrice,

        packagesCount,
        activePackagesCount: packagesCount,

        // Capabilities
        hasEnrollments: enrollmentsCount > 0,
        hasPackages: packagesCount > 0,
      };
    }),
  getBatches: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      /* ======================================================
       1. PROGRAM CHECK
    ====================================================== */

      const program = await db.query.programs.findFirst({
        where: eq(programs.id, input.id),

        columns: {
          id: true,
          title: true,
          scheduleType: true,
          status: true,
        },
      });

      if (!program) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      /* ======================================================
       2. FETCH BATCHES
    ====================================================== */

      const batches = await db.query.programBatches.findMany({
        where: eq(programBatches.programId, input.id),
        orderBy: (batches, { asc }) => [asc(batches.order)],

        columns: {
          id: true,
          programId: true,
          teacherId: true,

          title: true,
          slug: true,
          description: true,

          status: true,
          mode: true,

          startDate: true,
          endDate: true,
          registrationDeadline: true,

          capacity: true,
          enrolledCount: true,

          location: true,
          timezone: true,

          schedules: true,

          notes: true,
          brochureUrl: true,

          primaryCtaLabel: true,
          primaryCtaHref: true,

          secondaryCtaLabel: true,
          secondaryCtaHref: true,

          order: true,

          createdAt: true,
          updatedAt: true,
        },
      });

      /* ======================================================
       3. FETCH PACKAGES (ALL BATCHES)
    ====================================================== */

      const batchIds = batches.map((b) => b.id);

      const packages = await db
        .select()
        .from(programPackages)
        .where(
          and(
            eq(programPackages.programId, input.id),
            batchIds.length > 0
              ? inArray(programPackages.batchId, batchIds)
              : undefined,
          ),
        );

      /* ======================================================
       4. FETCH TEACHERS (HYDRATION)
    ====================================================== */

      const teacherIds = Array.from(
        new Set(batches.map((b) => b.teacherId).filter(Boolean)),
      ) as string[];

      const teachers =
        teacherIds.length > 0
          ? await db.query.user.findMany({
              where: inArray(user.id, teacherIds),

              columns: {
                id: true,
                name: true,
                image: true,
              },
            })
          : [];

      const teacherMap = new Map(teachers.map((t) => [t.id, t]));

      /* ======================================================
       5. GROUP PACKAGES BY BATCH
    ====================================================== */

      const packageMap = new Map<string, typeof packages>();

      for (const pkg of packages) {
        if (!pkg.batchId) continue;

        if (!packageMap.has(pkg.batchId)) {
          packageMap.set(pkg.batchId, []);
        }

        packageMap.get(pkg.batchId)!.push(pkg);
      }

      /* ======================================================
       6. BUILD VIEW MODEL
    ====================================================== */

      const formattedBatches = batches.map((batch) => {
        const batchPackages = packageMap.get(batch.id) ?? [];

        const teacher = batch.teacherId
          ? teacherMap.get(batch.teacherId)
          : null;

        /* ---------------------------
         UI derived state
      ---------------------------- */

        const capacity = batch.capacity ?? 0;
        const enrolled = batch.enrolledCount;

        const occupancyRate = capacity > 0 ? enrolled / capacity : 0;

        const isAlmostFull =
          capacity > 0 && occupancyRate >= 0.8 && occupancyRate < 1;

        const isFull = capacity > 0 && enrolled >= capacity;

        const isOpen = batch.status === "open";
        const isOngoing = batch.status === "open";

        const normalizePackage = (pkg: (typeof packages)[number]) => ({
          id: pkg.id,
          title: pkg.title,
          price: pkg.price,

          originalPrice: pkg.originalPrice ?? undefined,

          isDefault: pkg.isDefault,
          order: pkg.order,

          features: pkg.features ?? [],
        });

        return {
          id: batch.id,

          programId: batch.programId,

          title: batch.title,
          slug: batch.slug,
          description: batch.description,

          status: batch.status,
          mode: batch.mode,

          startDate: batch.startDate,
          endDate: batch.endDate,
          registrationDeadline: batch.registrationDeadline,

          capacity: batch.capacity,
          enrolledCount: batch.enrolledCount,

          location: batch.location,
          timezone: batch.timezone,

          schedules: batch.schedules,

          notes: batch.notes,
          brochureUrl: batch.brochureUrl,

          primaryCtaLabel: batch.primaryCtaLabel,
          primaryCtaHref: batch.primaryCtaHref,

          secondaryCtaLabel: batch.secondaryCtaLabel,
          secondaryCtaHref: batch.secondaryCtaHref,

          order: batch.order,

          teacher: teacher
            ? {
                id: teacher.id,
                name: teacher.name,
                avatar: teacher.image,
              }
            : null,

          packages: batchPackages.map(normalizePackage),

          ui: {
            isAlmostFull,
            isFull,
            isOpen,
            isOngoing,
            occupancyRate,
          },

          createdAt: batch.createdAt,
          updatedAt: batch.updatedAt,
        };
      });

      /* ======================================================
       7. AGGREGATES
    ====================================================== */

      const total = batches.length;
      const open = batches.filter((b) => b.status === "open").length;
      const ongoing = batches.filter((b) => b.status === "open").length;

      /* ======================================================
       8. RETURN
    ====================================================== */

      return {
        program: {
          id: program.id,
          title: program.title,
          scheduleType: program.scheduleType,
          status: program.status,
        },

        metrics: {
          totalBatches: total,
          openBatches: open,
          ongoingBatches: ongoing,
        },

        batches: formattedBatches,
      };
    }),
});

export type FilteredProgramsResult = RouterOutputs["programs"]["getFiltered"];

export type FilteredProgram = FilteredProgramsResult[number];
export type OverviewData = RouterOutputs["programs"]["getOverview"];
