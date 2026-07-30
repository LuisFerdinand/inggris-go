// app/modules/class/server/score.router.ts
import { z } from "zod";
import { eq, and, isNotNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import { classEnrollments, classes, studentScores } from "@/app/db/schema/classes";
import { programs } from "@/app/db/schema/programs";

import { scoreInput } from "../class.schema";
import { assertClassAccess, genId, isOversightRole } from "./access";
import { computeAverageScore, getProgressLabel } from "@/lib/lms/scoring";

async function loadClassEnrollmentOrThrow(classEnrollmentId: string) {
  const row = await db.query.classEnrollments.findFirst({
    where: eq(classEnrollments.id, classEnrollmentId),
  });

  if (!row) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Siswa tidak ditemukan di kelas ini" });
  }

  return row;
}

export const scoreRouter = createTRPCRouter({
  save: protectedProcedure
    .input(scoreInput)
    .mutation(async ({ input, ctx }) => {
      const enrollmentRow = await loadClassEnrollmentOrThrow(input.classEnrollmentId);
      const classRow = await assertClassAccess(enrollmentRow.classId, ctx.auth.userId, ctx.auth.role);

      if (classRow.status !== "completed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Selesaikan kelas terlebih dahulu sebelum memberi nilai",
        });
      }

      const existing = await db.query.studentScores.findFirst({
        where: eq(studentScores.classEnrollmentId, input.classEnrollmentId),
      });

      // Once finalized, only an oversight role (author/admin/super_admin)
      // can still approve/edit the teacher's marking — the teacher who
      // submitted it is locked out.
      if (existing?.finalizedAt && !isOversightRole(ctx.auth.role)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nilai sudah difinalisasi dan tidak dapat diubah",
        });
      }

      const { classEnrollmentId, ...scores } = input;

      const [row] = await db
        .insert(studentScores)
        .values({
          id: genId("score"),
          classId: classRow.id,
          classEnrollmentId,
          ...scores,
        })
        .onConflictDoUpdate({
          target: studentScores.classEnrollmentId,
          set: scores,
        })
        .returning();

      return row;
    }),

  finalize: protectedProcedure
    .input(z.object({ classEnrollmentId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const enrollmentRow = await loadClassEnrollmentOrThrow(input.classEnrollmentId);
      await assertClassAccess(enrollmentRow.classId, ctx.auth.userId, ctx.auth.role);

      const existing = await db.query.studentScores.findFirst({
        where: eq(studentScores.classEnrollmentId, input.classEnrollmentId),
      });

      if (!existing) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Nilai belum diisi" });
      }

      const [row] = await db
        .update(studentScores)
        .set({ finalizedAt: new Date() })
        .where(eq(studentScores.classEnrollmentId, input.classEnrollmentId))
        .returning();

      return row;
    }),

  getByClassEnrollment: protectedProcedure
    .input(z.object({ classEnrollmentId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const enrollmentRow = await loadClassEnrollmentOrThrow(input.classEnrollmentId);
      await assertClassAccess(enrollmentRow.classId, ctx.auth.userId, ctx.auth.role);

      const score = await db.query.studentScores.findFirst({
        where: eq(studentScores.classEnrollmentId, input.classEnrollmentId),
      });

      return score ?? null;
    }),

  listByClass: protectedProcedure
    .input(z.object({ classId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      await assertClassAccess(input.classId, ctx.auth.userId, ctx.auth.role);

      const roster = await db.query.classEnrollments.findMany({
        where: and(
          eq(classEnrollments.classId, input.classId),
          eq(classEnrollments.isRemoved, false),
        ),
        with: { score: true },
      });

      return roster.map((student) => {
        const score = student.score;
        const average = score
          ? computeAverageScore({
              grammarAccuracy: score.grammarAccuracy,
              pronunciation: score.pronunciation,
              vocabulary: score.vocabulary,
              fluency: score.fluency,
              confidence: score.confidence,
              listening: score.listening,
              participation: score.participation,
            })
          : null;

        return {
          classEnrollmentId: student.id,
          studentName: student.studentName,
          score,
          average,
          progressLabel: average != null ? getProgressLabel(average) : null,
        };
      });
    }),

  /**
   * Finalized reports belonging to the currently logged-in student —
   * feeds the "Laporan Perkembangan" section on their own dashboard.
   */
  getMyReports: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.auth?.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const rows = await db
      .select({
        scoreId: studentScores.id,
        classEnrollmentId: studentScores.classEnrollmentId,
        finalizedAt: studentScores.finalizedAt,
        classId: classes.id,
        classTitle: classes.title,
        periodLabel: classes.periodLabel,
        programTitle: programs.title,
      })
      .from(studentScores)
      .innerJoin(classEnrollments, eq(studentScores.classEnrollmentId, classEnrollments.id))
      .innerJoin(classes, eq(classEnrollments.classId, classes.id))
      .innerJoin(programs, eq(classes.programId, programs.id))
      .where(
        and(
          eq(classEnrollments.studentUserId, ctx.auth.userId),
          isNotNull(studentScores.finalizedAt),
        ),
      );

    return rows;
  }),
});
