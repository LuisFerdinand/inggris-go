// app/modules/program/server/batch.router.ts
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import { programs, programBatches } from "@/app/db/schema";

import { generateUniqueSlug, getNextOrder } from "./program.slug";
import { batchInsertSchema, batchUpdateSchema } from "../batch.schema";

async function assertScheduledProgram(programId: string) {
  const program = await db.query.programs.findFirst({
    where: eq(programs.id, programId),
  });

  if (!program) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Program tidak ditemukan" });
  }

  if (program.scheduleType !== "scheduled") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Batch hanya bisa dibuat untuk program scheduled",
    });
  }

  return program;
}

export const batchRouter = createTRPCRouter({
  listByProgram: protectedProcedure
    .input(z.object({ programId: z.string() }))
    .query(async ({ input }) => {
      const rows = await db.query.programBatches.findMany({
        where: eq(programBatches.programId, input.programId),
        orderBy: [asc(programBatches.order)],
        with: { packages: true },
      });

      return rows.map((batch) => {
        const occupancyRate =
          batch.capacity && batch.capacity > 0
            ? batch.enrolledCount / batch.capacity
            : 0;
        const isFull = !!batch.capacity && batch.enrolledCount >= batch.capacity;

        return {
          ...batch,
          teacher: null as { id: string; name: string; avatar?: string | null } | null,
          packages: [...(batch.packages ?? [])].sort((a, b) => a.order - b.order),
          ui: {
            isAlmostFull: occupancyRate >= 0.8 && !isFull,
            isFull,
            isOpen: batch.status === "open",
            isOngoing: batch.status === "ongoing",
            occupancyRate,
          },
        };
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const batch = await db.query.programBatches.findFirst({
        where: eq(programBatches.id, input.id),
        with: { packages: true },
      });

      if (!batch) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Batch tidak ditemukan" });
      }

      return batch;
    }),

  create: protectedProcedure
    .input(batchInsertSchema)
    .mutation(async ({ input }) => {
      await assertScheduledProgram(input.programId);

      const slug = await generateUniqueSlug({
        table: programBatches,
        slugColumn: programBatches.slug,
        title: input.title,
      });

      const order = await getNextOrder({
        table: programBatches,
        orderColumn: programBatches.order,
        where: eq(programBatches.programId, input.programId),
      });

      const [row] = await db
        .insert(programBatches)
        .values({
          ...input,
          id: crypto.randomUUID(),
          slug,
          order,
        })
        .returning();

      return row;
    }),

  update: protectedProcedure
    .input(batchUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, title, programId, ...rest } = input;

      const existing = await db.query.programBatches.findFirst({
        where: eq(programBatches.id, id),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Batch tidak ditemukan" });
      }

      if (programId && programId !== existing.programId) {
        await assertScheduledProgram(programId);
      }

      const slug = title
        ? await generateUniqueSlug({
            table: programBatches,
            slugColumn: programBatches.slug,
            idColumn: programBatches.id,
            title,
            excludeId: id,
          })
        : undefined;

      const [row] = await db
        .update(programBatches)
        .set({
          ...rest,
          ...(programId ? { programId } : {}),
          ...(title ? { title } : {}),
          ...(slug ? { slug } : {}),
        })
        .where(eq(programBatches.id, id))
        .returning();

      return row;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(programBatches).where(eq(programBatches.id, input.id));
      return { success: true };
    }),

  getTeachers: protectedProcedure.query(async () => {
    const { user } = await import("@/app/db/schema");
    return db.select({ id: user.id, name: user.name }).from(user);
  }),
});
