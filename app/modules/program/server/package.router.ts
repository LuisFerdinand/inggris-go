// app/modules/program/server/package.router.ts
import { z } from "zod";
import { and, asc, eq, isNull, ne } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import { programs, programPackages } from "@/app/db/schema";

import { generateUniqueSlug, getNextOrder } from "./program.slug";
import { packageInsertSchema, packageUpdateSchema } from "../package.schema";

async function clearOtherDefaults(opts: {
  programId: string;
  batchId: string | null;
  exceptId?: string;
}) {
  const conditions = [eq(programPackages.programId, opts.programId)];

  conditions.push(
    opts.batchId
      ? eq(programPackages.batchId, opts.batchId)
      : isNull(programPackages.batchId),
  );

  if (opts.exceptId) conditions.push(ne(programPackages.id, opts.exceptId));

  await db
    .update(programPackages)
    .set({ isDefault: false })
    .where(and(...conditions));
}

async function assertPackageScope(input: {
  programId: string;
  batchId: string | null;
}) {
  const program = await db.query.programs.findFirst({
    where: eq(programs.id, input.programId),
  });

  if (!program) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Program tidak ditemukan" });
  }

  if (program.scheduleType === "scheduled" && !input.batchId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Program scheduled membutuhkan batch untuk membuat paket",
    });
  }

  if (program.scheduleType === "permanent" && input.batchId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Program permanent tidak menggunakan batch",
    });
  }

  return program;
}

function scopeWhere(programId: string, batchId: string | null) {
  return and(
    eq(programPackages.programId, programId),
    batchId ? eq(programPackages.batchId, batchId) : isNull(programPackages.batchId),
  );
}

export const packageRouter = createTRPCRouter({
  listByProgram: protectedProcedure
    .input(
      z.object({
        programId: z.string(),
        /**
         * undefined = all packages in the program
         * null      = only direct program packages
         * string    = only packages for this batch
         */
        batchId: z.string().nullable().optional(),
      }),
    )
    .query(async ({ input }) => {
      const where =
        input.batchId === undefined
          ? eq(programPackages.programId, input.programId)
          : scopeWhere(input.programId, input.batchId);

      return db.query.programPackages.findMany({
        where,
        orderBy: [asc(programPackages.order)],
        with: { batch: true },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const pkg = await db.query.programPackages.findFirst({
        where: eq(programPackages.id, input.id),
        with: { batch: true, program: true },
      });

      if (!pkg) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Paket tidak ditemukan" });
      }

      return pkg;
    }),

  create: protectedProcedure
    .input(packageInsertSchema)
    .mutation(async ({ input }) => {
      const batchId = input.batchId ?? null;
      await assertPackageScope({ programId: input.programId, batchId });

      const slug = await generateUniqueSlug({
        table: programPackages,
        slugColumn: programPackages.slug,
        title: input.title,
        where: scopeWhere(input.programId, batchId),
      });

      const order = await getNextOrder({
        table: programPackages,
        orderColumn: programPackages.order,
        where: scopeWhere(input.programId, batchId),
      });

      if (input.isDefault) {
        await clearOtherDefaults({ programId: input.programId, batchId });
      }

      const [row] = await db
        .insert(programPackages)
        .values({
          ...input,
          id: crypto.randomUUID(),
          batchId,
          slug,
          order,
        })
        .returning();

      return row;
    }),

  update: protectedProcedure
    .input(packageUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;

      const existing = await db.query.programPackages.findFirst({
        where: eq(programPackages.id, id),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Paket tidak ditemukan" });
      }

      const nextProgramId = rest.programId ?? existing.programId;
      const nextBatchId = rest.batchId === undefined ? existing.batchId : (rest.batchId ?? null);

      await assertPackageScope({ programId: nextProgramId, batchId: nextBatchId });

      const nextSlug = rest.title
        ? await generateUniqueSlug({
            table: programPackages,
            slugColumn: programPackages.slug,
            idColumn: programPackages.id,
            title: rest.title,
            excludeId: id,
            where: scopeWhere(nextProgramId, nextBatchId),
          })
        : undefined;

      if (rest.isDefault) {
        await clearOtherDefaults({
          programId: nextProgramId,
          batchId: nextBatchId,
          exceptId: id,
        });
      }

      const [row] = await db
        .update(programPackages)
        .set({
          ...rest,
          batchId: nextBatchId,
          ...(nextSlug ? { slug: nextSlug } : {}),
        })
        .where(eq(programPackages.id, id))
        .returning();

      return row;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(programPackages).where(eq(programPackages.id, input.id));
      return { success: true };
    }),
});
