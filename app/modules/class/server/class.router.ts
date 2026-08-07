// app/modules/class/server/class.router.ts
import { z } from "zod";
import { and, desc, eq, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import { classes, classEnrollments } from "@/app/db/schema/classes";
import { programBatches } from "@/app/db/schema/programs";
import { enrollments } from "@/app/db/schema/orders";
import { user } from "@/app/db/schema/auth-schema";
import { role, userRole } from "@/app/db/schema/roles";

import {
  addStudentsInput,
  createClassInput,
  updateClassInput,
} from "../class.schema";
import {
  assertClassAccess,
  genId,
  isOversightRole,
  requireClassManageAccess,
  requireTeachingAccess,
} from "./access";
import { notifyUser } from "@/app/modules/notifications/server/create-notification";

const REGISTERED_STATUSES = ["paid", "confirmed"] as const;

export const classRouter = createTRPCRouter({
  /**
   * Batches the current teacher is assigned to (or every batch, for
   * admin/super_admin oversight) — used to pick which batch a new class
   * is created off of.
   */
  listMyBatches: protectedProcedure.query(async ({ ctx }) => {
    requireTeachingAccess(ctx.auth.userId, ctx.auth.role);

    const rows = await db.query.programBatches.findMany({
      where: isOversightRole(ctx.auth.role)
        ? undefined
        : eq(programBatches.teacherId, ctx.auth.userId),
      orderBy: [desc(programBatches.startDate)],
      with: { program: true },
    });

    return rows;
  }),

  /**
   * Registered (paid/confirmed) students for a batch, flagged with
   * whether they're already rostered into an active class of that batch.
   */
  getRegisteredStudents: protectedProcedure
    .input(z.object({ batchId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      requireTeachingAccess(ctx.auth.userId, ctx.auth.role);

      const batch = await db.query.programBatches.findFirst({
        where: eq(programBatches.id, input.batchId),
      });

      if (!batch) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Batch tidak ditemukan" });
      }

      if (!isOversightRole(ctx.auth.role) && batch.teacherId !== ctx.auth.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Anda tidak ditugaskan pada batch ini" });
      }

      const registered = await db.query.enrollments.findMany({
        where: and(
          eq(enrollments.batchId, input.batchId),
          inArray(enrollments.status, REGISTERED_STATUSES),
        ),
        orderBy: [desc(enrollments.createdAt)],
      });

      const rostered = await db
        .select({ enrollmentId: classEnrollments.enrollmentId })
        .from(classEnrollments)
        .innerJoin(classes, eq(classEnrollments.classId, classes.id))
        .where(
          and(
            eq(classes.batchId, input.batchId),
            eq(classEnrollments.isRemoved, false),
          ),
        );

      const rosteredIds = new Set(rostered.map((row) => row.enrollmentId));

      return registered.map((row) => ({
        ...row,
        alreadyRostered: rosteredIds.has(row.id),
      }));
    }),

  create: protectedProcedure
    .input(createClassInput)
    .mutation(async ({ input, ctx }) => {
      requireClassManageAccess(ctx.auth.userId, ctx.auth.role);

      const batch = await db.query.programBatches.findFirst({
        where: eq(programBatches.id, input.batchId),
      });

      if (!batch) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Batch tidak ditemukan" });
      }

      const classId = genId("class");

      await db.insert(classes).values({
        id: classId,
        batchId: batch.id,
        programId: batch.programId,
        teacherId: input.teacherId,
        title: input.title,
        periodLabel: input.periodLabel,
        startDate: input.startDate,
        endDate: input.endDate,
        notes: input.notes,
      });

      if (input.enrollmentIds.length > 0) {
        const rows = await db.query.enrollments.findMany({
          where: inArray(enrollments.id, input.enrollmentIds),
        });

        if (rows.length > 0) {
          await db.insert(classEnrollments).values(
            rows.map((row) => ({
              id: genId("cenr"),
              classId,
              enrollmentId: row.id,
              studentName: row.childName || row.customerName,
              studentUserId: row.userId,
            })),
          );
        }
      }

      if (input.teacherId !== ctx.auth.userId) {
        const actorName = ctx.session?.user?.name ?? "Admin";
        await notifyUser(input.teacherId, {
          category: "class",
          type: "class_assigned",
          title: "Anda ditugaskan mengajar kelas baru",
          body: `"${input.title}" — ditugaskan oleh ${actorName}`,
          link: `/dashboard/teaching/classes/${classId}`,
        });
      }

      const created = await db.query.classes.findFirst({
        where: eq(classes.id, classId),
      });

      return created;
    }),

  update: protectedProcedure
    .input(updateClassInput)
    .mutation(async ({ input, ctx }) => {
      await assertClassAccess(input.id, ctx.auth.userId, ctx.auth.role);

      if (input.teacherId && !isOversightRole(ctx.auth.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Hanya author/admin/super admin yang dapat mengubah guru kelas",
        });
      }

      const { id, teacherId, ...rest } = input;

      const [row] = await db
        .update(classes)
        .set(teacherId ? { ...rest, teacherId } : rest)
        .where(eq(classes.id, id))
        .returning();

      if (teacherId && teacherId !== ctx.auth.userId) {
        const actorName = ctx.session?.user?.name ?? "Admin";
        await notifyUser(teacherId, {
          category: "class",
          type: "class_assigned",
          title: "Anda ditugaskan mengajar sebuah kelas",
          body: `"${row?.title ?? ""}" — ditugaskan oleh ${actorName}`,
          link: `/dashboard/teaching/classes/${id}`,
        });
      }

      return row;
    }),

  finish: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const existing = await assertClassAccess(input.id, ctx.auth.userId, ctx.auth.role);

      if (existing.status !== "active" && existing.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kelas ini sudah diselesaikan",
        });
      }

      const [row] = await db
        .update(classes)
        .set({ status: "completed" })
        .where(eq(classes.id, input.id))
        .returning();

      return row;
    }),

  activate: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      await assertClassAccess(input.id, ctx.auth.userId, ctx.auth.role);

      const [row] = await db
        .update(classes)
        .set({ status: "active" })
        .where(eq(classes.id, input.id))
        .returning();

      return row;
    }),

  listMine: protectedProcedure
    .input(
      z.object({
        teacherId: z.string().optional(),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      requireTeachingAccess(ctx.auth.userId, ctx.auth.role);

      const oversight = isOversightRole(ctx.auth.role);

      const where = oversight
        ? input?.teacherId
          ? eq(classes.teacherId, input.teacherId)
          : undefined
        : eq(classes.teacherId, ctx.auth.userId);

      const rows = await db.query.classes.findMany({
        where,
        orderBy: [desc(classes.createdAt)],
        with: {
          batch: true,
          program: true,
          teacher: { columns: { id: true, name: true, email: true } },
          roster: { columns: { id: true } },
        },
      });

      return rows;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const existing = await assertClassAccess(input.id, ctx.auth.userId, ctx.auth.role);

      const withRelations = await db.query.classes.findFirst({
        where: eq(classes.id, existing.id),
        with: {
          batch: true,
          program: true,
          teacher: { columns: { id: true, name: true, email: true } },
          roster: {
            where: eq(classEnrollments.isRemoved, false),
            with: { score: true },
          },
        },
      });

      if (!withRelations) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Kelas tidak ditemukan" });
      }

      return withRelations;
    }),

  addStudents: protectedProcedure
    .input(addStudentsInput)
    .mutation(async ({ input, ctx }) => {
      const existing = await assertClassAccess(input.classId, ctx.auth.userId, ctx.auth.role);

      const rows = await db.query.enrollments.findMany({
        where: inArray(enrollments.id, input.enrollmentIds),
      });

      if (rows.length === 0) {
        return [];
      }

      const inserted = await db
        .insert(classEnrollments)
        .values(
          rows.map((row) => ({
            id: genId("cenr"),
            classId: existing.id,
            enrollmentId: row.id,
            studentName: row.childName || row.customerName,
            studentUserId: row.userId,
          })),
        )
        .onConflictDoNothing()
        .returning();

      return inserted;
    }),

  removeStudent: protectedProcedure
    .input(z.object({ classEnrollmentId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const row = await db.query.classEnrollments.findFirst({
        where: eq(classEnrollments.id, input.classEnrollmentId),
      });

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Siswa tidak ditemukan di kelas ini" });
      }

      await assertClassAccess(row.classId, ctx.auth.userId, ctx.auth.role);

      await db
        .update(classEnrollments)
        .set({ isRemoved: true })
        .where(eq(classEnrollments.id, input.classEnrollmentId));

      return { success: true };
    }),

  /**
   * Teachers that have at least one class — populates the teacher
   * filter dropdown on the admin oversight classes list.
   */
  listTeacherFilterOptions: protectedProcedure.query(async ({ ctx }) => {
    requireTeachingAccess(ctx.auth.userId, ctx.auth.role);

    return db
      .selectDistinct({ id: user.id, name: user.name })
      .from(classes)
      .innerJoin(user, eq(classes.teacherId, user.id));
  }),

  /**
   * Every user who can run/mark a class — teachers, plus author/admin/
   * super_admin who also get full teaching oversight (see isOversightRole)
   * and may want to be the teacher-of-record themselves. Populates the
   * teacher-picker used by author/admin/super_admin when creating a class
   * or reassigning an existing one.
   */
  listAssignableTeachers: protectedProcedure.query(async ({ ctx }) => {
    requireClassManageAccess(ctx.auth.userId, ctx.auth.role);

    return db
      .selectDistinct({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .innerJoin(userRole, eq(userRole.userId, user.id))
      .innerJoin(role, eq(role.id, userRole.roleId))
      .where(inArray(role.name, ["teacher", "author", "admin", "super_admin"]));
  }),
});
