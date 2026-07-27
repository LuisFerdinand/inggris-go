// app/modules/class/server/session.router.ts
import { z } from "zod";
import { asc, eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import {
  attendanceRecords,
  classEnrollments,
  classSessions,
} from "@/app/db/schema/classes";

import { createSessionInput, recordAttendanceInput } from "../class.schema";
import { assertClassAccess, genId } from "./access";

async function assertSessionAccess(
  sessionId: string,
  userId: string,
  role: Parameters<typeof assertClassAccess>[2],
) {
  const session = await db.query.classSessions.findFirst({
    where: eq(classSessions.id, sessionId),
  });

  if (!session) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Sesi tidak ditemukan" });
  }

  await assertClassAccess(session.classId, userId, role);

  return session;
}

export const sessionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createSessionInput)
    .mutation(async ({ input, ctx }) => {
      await assertClassAccess(input.classId, ctx.auth.userId, ctx.auth.role);

      const existing = await db.query.classSessions.findMany({
        where: eq(classSessions.classId, input.classId),
      });

      const [row] = await db
        .insert(classSessions)
        .values({
          id: genId("csess"),
          classId: input.classId,
          sessionDate: input.sessionDate,
          label: input.label ?? `Hari ${existing.length + 1}`,
          order: existing.length,
        })
        .returning();

      return row;
    }),

  list: protectedProcedure
    .input(z.object({ classId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      await assertClassAccess(input.classId, ctx.auth.userId, ctx.auth.role);

      return db.query.classSessions.findMany({
        where: eq(classSessions.classId, input.classId),
        orderBy: [asc(classSessions.order), asc(classSessions.sessionDate)],
      });
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      await assertSessionAccess(input.id, ctx.auth.userId, ctx.auth.role);

      await db.delete(classSessions).where(eq(classSessions.id, input.id));

      return { success: true };
    }),

  recordAttendance: protectedProcedure
    .input(recordAttendanceInput)
    .mutation(async ({ input, ctx }) => {
      await assertSessionAccess(
        input.classSessionId,
        ctx.auth.userId,
        ctx.auth.role,
      );

      for (const record of input.records) {
        await db
          .insert(attendanceRecords)
          .values({
            id: genId("att"),
            classSessionId: input.classSessionId,
            classEnrollmentId: record.classEnrollmentId,
            status: record.status,
            note: record.note,
          })
          .onConflictDoUpdate({
            target: [
              attendanceRecords.classSessionId,
              attendanceRecords.classEnrollmentId,
            ],
            set: {
              status: record.status,
              note: record.note,
              recordedAt: new Date(),
            },
          });
      }

      // Session-wide extras (also optional, filled in by the teacher
      // alongside attendance): recording/materials link and a class note.
      const sessionUpdates: { googleDriveLink?: string | null; note?: string | null } = {};
      if (input.googleDriveLink !== undefined) {
        sessionUpdates.googleDriveLink = input.googleDriveLink || null;
      }
      if (input.sessionNote !== undefined) {
        sessionUpdates.note = input.sessionNote || null;
      }
      if (Object.keys(sessionUpdates).length > 0) {
        await db
          .update(classSessions)
          .set(sessionUpdates)
          .where(eq(classSessions.id, input.classSessionId));
      }

      return { success: true };
    }),

  getAttendance: protectedProcedure
    .input(z.object({ classSessionId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const session = await assertSessionAccess(
        input.classSessionId,
        ctx.auth.userId,
        ctx.auth.role,
      );

      const roster = await db.query.classEnrollments.findMany({
        where: and(
          eq(classEnrollments.classId, session.classId),
          eq(classEnrollments.isRemoved, false),
        ),
      });

      const records = await db.query.attendanceRecords.findMany({
        where: eq(attendanceRecords.classSessionId, input.classSessionId),
      });

      const byEnrollment = new Map(
        records.map((record) => [record.classEnrollmentId, record]),
      );

      return roster.map((student) => ({
        classEnrollmentId: student.id,
        studentName: student.studentName,
        status: byEnrollment.get(student.id)?.status ?? null,
        note: byEnrollment.get(student.id)?.note ?? null,
      }));
    }),

  getAttendanceSummary: protectedProcedure
    .input(z.object({ classId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      await assertClassAccess(input.classId, ctx.auth.userId, ctx.auth.role);

      const roster = await db.query.classEnrollments.findMany({
        where: and(
          eq(classEnrollments.classId, input.classId),
          eq(classEnrollments.isRemoved, false),
        ),
      });

      const sessions = await db.query.classSessions.findMany({
        where: eq(classSessions.classId, input.classId),
      });

      const sessionIds = sessions.map((session) => session.id);

      const records = sessionIds.length
        ? await db.query.attendanceRecords.findMany({
            where: (fields, { inArray }) =>
              inArray(fields.classSessionId, sessionIds),
          })
        : [];

      return roster.map((student) => {
        const studentRecords = records.filter(
          (record) => record.classEnrollmentId === student.id,
        );

        return {
          classEnrollmentId: student.id,
          studentName: student.studentName,
          totalSessions: sessions.length,
          present: studentRecords.filter((r) => r.status === "present").length,
          absent: studentRecords.filter((r) => r.status === "absent").length,
          late: studentRecords.filter((r) => r.status === "late").length,
          excused: studentRecords.filter((r) => r.status === "excused").length,
        };
      });
    }),
});
