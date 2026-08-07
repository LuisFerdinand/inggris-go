// app/modules/class/server/score.router.ts
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import { classEnrollments, classes, studentScores } from "@/app/db/schema/classes";
import { programs } from "@/app/db/schema/programs";

import { reviewScoreInput, scoreInput } from "../class.schema";
import { assertClassAccess, genId, isOversightRole } from "./access";
import { computeAverageScore, getProgressLabel } from "@/lib/lms/scoring";
import {
  getOversightUserIds,
  notifyUser,
  notifyUsers,
} from "@/app/modules/notifications/server/create-notification";

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

      // Once submitted for review (or approved), only an oversight role
      // (author/admin/super_admin) can still edit — the teacher who
      // submitted it is locked out until it's rejected back to them.
      const isLockedForTeacher =
        existing &&
        (existing.status === "pending_review" || existing.status === "approved");

      if (isLockedForTeacher && !isOversightRole(ctx.auth.role)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nilai sedang diproses dan tidak dapat diubah",
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

  /**
   * A teacher submits a filled-in score for approval. If the caller
   * already holds an oversight role (author/admin/super_admin) — e.g. they
   * are both the assigned teacher and a manager — the score is
   * self-approved immediately, mirroring the task board's self-approval
   * for creators who can already approve tasks.
   */
  submitForApproval: protectedProcedure
    .input(z.object({ classEnrollmentId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const enrollmentRow = await loadClassEnrollmentOrThrow(input.classEnrollmentId);
      const classRow = await assertClassAccess(enrollmentRow.classId, ctx.auth.userId, ctx.auth.role);

      const existing = await db.query.studentScores.findFirst({
        where: eq(studentScores.classEnrollmentId, input.classEnrollmentId),
      });

      if (!existing) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Nilai belum diisi" });
      }

      if (existing.status !== "draft" && existing.status !== "rejected") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nilai ini sudah diajukan atau sudah disetujui",
        });
      }

      const selfApprove = isOversightRole(ctx.auth.role);
      const now = new Date();

      const [row] = await db
        .update(studentScores)
        .set(
          selfApprove
            ? {
                status: "approved",
                finalizedAt: now,
                reviewedBy: ctx.auth.userId,
                reviewedAt: now,
                reviewNote: null,
              }
            : {
                status: "pending_review",
                submittedAt: now,
                reviewNote: null,
              },
        )
        .where(eq(studentScores.classEnrollmentId, input.classEnrollmentId))
        .returning();

      if (!selfApprove) {
        const actorName = ctx.session?.user?.name ?? "Guru";
        await notifyUsers(await getOversightUserIds(), {
          category: "class",
          type: "score_pending_review",
          title: "Nilai menunggu persetujuan",
          body: `${actorName} mengajukan nilai ${enrollmentRow.studentName} — "${classRow.title}"`,
          link: "/dashboard/teaching/classes/persetujuan",
        });
      }

      return row;
    }),

  /**
   * Author/admin/super_admin approves or rejects a submitted score.
   * Approving publishes it to the student's dashboard; rejecting sends it
   * back to the teacher (with a required reason) to fix and resubmit.
   */
  review: protectedProcedure
    .input(reviewScoreInput)
    .mutation(async ({ input, ctx }) => {
      const enrollmentRow = await loadClassEnrollmentOrThrow(input.classEnrollmentId);
      const classRow = await assertClassAccess(enrollmentRow.classId, ctx.auth.userId, ctx.auth.role);

      if (!isOversightRole(ctx.auth.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Hanya author, admin, atau super admin yang dapat menyetujui nilai",
        });
      }

      const existing = await db.query.studentScores.findFirst({
        where: eq(studentScores.classEnrollmentId, input.classEnrollmentId),
      });

      if (!existing || existing.status !== "pending_review") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nilai ini tidak sedang menunggu persetujuan",
        });
      }

      const now = new Date();

      const [row] = await db
        .update(studentScores)
        .set(
          input.decision === "approve"
            ? {
                status: "approved",
                finalizedAt: now,
                reviewedBy: ctx.auth.userId,
                reviewedAt: now,
                reviewNote: null,
              }
            : {
                status: "rejected",
                reviewedBy: ctx.auth.userId,
                reviewedAt: now,
                reviewNote: input.reviewNote,
              },
        )
        .where(eq(studentScores.classEnrollmentId, input.classEnrollmentId))
        .returning();

      if (classRow.teacherId !== ctx.auth.userId) {
        await notifyUser(classRow.teacherId, {
          category: "class",
          type: input.decision === "approve" ? "score_approved" : "score_rejected",
          title: input.decision === "approve" ? "Nilai disetujui" : "Nilai ditolak",
          body:
            input.decision === "approve"
              ? `Nilai ${enrollmentRow.studentName} — "${classRow.title}" telah disetujui`
              : `Nilai ${enrollmentRow.studentName} — "${classRow.title}" ditolak — ${input.reviewNote}`,
          link: `/dashboard/teaching/classes/${classRow.id}`,
        });
      }

      return row;
    }),

  /**
   * Every score awaiting approval, across all classes — feeds the
   * "Persetujuan Nilai" queue page for author/admin/super_admin.
   */
  listPendingReview: protectedProcedure.query(async ({ ctx }) => {
    if (!isOversightRole(ctx.auth.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Hanya author, admin, atau super admin yang dapat melihat antrean ini",
      });
    }

    return db
      .select({
        classEnrollmentId: studentScores.classEnrollmentId,
        studentName: classEnrollments.studentName,
        submittedAt: studentScores.submittedAt,
        classId: classes.id,
        classTitle: classes.title,
        programTitle: programs.title,
      })
      .from(studentScores)
      .innerJoin(classEnrollments, eq(studentScores.classEnrollmentId, classEnrollments.id))
      .innerJoin(classes, eq(classEnrollments.classId, classes.id))
      .innerJoin(programs, eq(classes.programId, programs.id))
      .where(eq(studentScores.status, "pending_review"));
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
   * Approved reports belonging to the currently logged-in student —
   * feeds the "Laporan Perkembangan" section on their own dashboard.
   * Only scores an oversight role has approved ever reach this list.
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
          eq(studentScores.status, "approved"),
        ),
      );

    return rows;
  }),
});
