// app/modules/task-board/server/task-board.router.ts
import { z } from "zod";
import { and, eq, inArray, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import { tasks, taskComments, taskAttachments } from "@/app/db/schema/tasks";
import { user } from "@/app/db/schema/auth-schema";
import { role, userRole } from "@/app/db/schema/roles";

import {
  addCommentInput,
  BOARD_COLUMN_STATUS,
  confirmDoneInput,
  createTaskInput,
  deleteCommentInput,
  deleteTaskInput,
  listTasksInput,
  moveTaskInput,
  resubmitTaskInput,
  updateTaskInput,
  verifyTaskInput,
} from "../task-board.schema";
import {
  TASK_BOARD_ROLES,
  assertTaskOwnerAccess,
  genId,
  isSuperAdmin,
  loadTaskOrThrow,
  requireTaskBoardAccess,
} from "./access";

const USER_COLUMNS = { id: true, name: true, email: true, image: true } as const;

export const taskBoardRouter = createTRPCRouter({
  list: protectedProcedure.input(listTasksInput).query(async ({ ctx, input }) => {
    requireTaskBoardAccess(ctx.auth.userId, ctx.auth.role);

    const conditions = [];
    if (input?.status) conditions.push(eq(tasks.status, input.status));
    if (input?.priority) conditions.push(eq(tasks.priority, input.priority));
    if (input?.assigneeId) conditions.push(eq(tasks.assigneeId, input.assigneeId));
    if (input?.mine) conditions.push(eq(tasks.createdBy, ctx.auth.userId));

    const rows = await db.query.tasks.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      orderBy: (row, { asc, desc }) => [asc(row.position), desc(row.createdAt)],
      with: {
        creator: { columns: USER_COLUMNS },
        assignee: { columns: USER_COLUMNS },
        verifier: { columns: USER_COLUMNS },
      },
    });

    if (rows.length === 0) return [];

    const taskIds = rows.map((row) => row.id);

    const commentCounts = await db
      .select({ taskId: taskComments.taskId, count: sql<number>`count(*)`.mapWith(Number) })
      .from(taskComments)
      .where(inArray(taskComments.taskId, taskIds))
      .groupBy(taskComments.taskId);

    const commentCountMap = new Map(commentCounts.map((row) => [row.taskId, row.count]));

    return rows.map((row) => ({
      ...row,
      commentCount: commentCountMap.get(row.id) ?? 0,
    }));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      requireTaskBoardAccess(ctx.auth.userId, ctx.auth.role);

      const row = await db.query.tasks.findFirst({
        where: eq(tasks.id, input.id),
        with: {
          creator: { columns: USER_COLUMNS },
          assignee: { columns: USER_COLUMNS },
          verifier: { columns: USER_COLUMNS },
          attachments: {
            where: (attachment, { isNull }) => isNull(attachment.commentId),
            orderBy: (attachment, { asc }) => [asc(attachment.createdAt)],
          },
          comments: {
            orderBy: (comment, { asc }) => [asc(comment.createdAt)],
            with: {
              author: { columns: USER_COLUMNS },
              attachments: { orderBy: (a, { asc }) => [asc(a.createdAt)] },
            },
          },
        },
      });

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tugas tidak ditemukan" });
      }

      return row;
    }),

  create: protectedProcedure
    .input(createTaskInput)
    .mutation(async ({ ctx, input }) => {
      requireTaskBoardAccess(ctx.auth.userId, ctx.auth.role);

      const id = genId("task");
      // A super_admin's own tasks skip verification and land straight in
      // "Direncanakan" — they're already the one who'd approve it anyway.
      const selfApproved = isSuperAdmin(ctx.auth.role);

      await db.insert(tasks).values({
        id,
        title: input.title,
        description: input.description,
        priority: input.priority,
        createdBy: ctx.auth.userId,
        assigneeId: input.assigneeId,
        startDate: input.startDate,
        dueDate: input.dueDate,
        coverImageUrl: input.coverImageUrl,
        status: selfApproved ? "direncanakan" : "pending_review",
        verifiedBy: selfApproved ? ctx.auth.userId : null,
        verifiedAt: selfApproved ? new Date() : null,
      });

      return db.query.tasks.findFirst({ where: eq(tasks.id, id) });
    }),

  update: protectedProcedure
    .input(updateTaskInput)
    .mutation(async ({ ctx, input }) => {
      await assertTaskOwnerAccess(input.id, ctx.auth.userId, ctx.auth.role);

      const { id, ...rest } = input;

      const [row] = await db
        .update(tasks)
        .set(rest)
        .where(eq(tasks.id, id))
        .returning();

      return row;
    }),

  move: protectedProcedure
    .input(moveTaskInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await assertTaskOwnerAccess(input.id, ctx.auth.userId, ctx.auth.role);

      if (!BOARD_COLUMN_STATUS.includes(existing.status as (typeof BOARD_COLUMN_STATUS)[number])) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Tugas ini belum diverifikasi oleh super admin",
        });
      }

      const [row] = await db
        .update(tasks)
        .set({ status: input.status, position: input.position })
        .where(eq(tasks.id, input.id))
        .returning();

      return row;
    }),

  verify: protectedProcedure
    .input(verifyTaskInput)
    .mutation(async ({ ctx, input }) => {
      if (!isSuperAdmin(ctx.auth.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Hanya super admin yang dapat memverifikasi tugas",
        });
      }

      const existing = await loadTaskOrThrow(input.id);

      if (existing.status !== "pending_review") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tugas ini sudah diverifikasi sebelumnya",
        });
      }

      const [row] = await db
        .update(tasks)
        .set({
          status: input.decision === "approve" ? "direncanakan" : "rejected",
          verifiedBy: ctx.auth.userId,
          verifiedAt: new Date(),
          reviewNote: input.decision === "reject" ? input.reviewNote : null,
        })
        .where(eq(tasks.id, input.id))
        .returning();

      return row;
    }),

  /**
   * Super_admin confirms a task under review as actually done. The only
   * way into "done" — dragging or editing your way in is blocked so every
   * completed task has passed a review.
   */
  confirmDone: protectedProcedure
    .input(confirmDoneInput)
    .mutation(async ({ ctx, input }) => {
      if (!isSuperAdmin(ctx.auth.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Hanya super admin yang dapat menandai tugas selesai",
        });
      }

      const existing = await loadTaskOrThrow(input.id);

      if (existing.status !== "review") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tugas ini belum diajukan untuk review",
        });
      }

      const [row] = await db
        .update(tasks)
        .set({ status: "done" })
        .where(eq(tasks.id, input.id))
        .returning();

      return row;
    }),

  resubmit: protectedProcedure
    .input(resubmitTaskInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await loadTaskOrThrow(input.id);

      if (existing.createdBy !== ctx.auth.userId && !isSuperAdmin(ctx.auth.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Hanya pembuat tugas yang dapat mengajukan ulang",
        });
      }

      if (existing.status !== "rejected") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hanya tugas yang ditolak yang dapat diajukan ulang",
        });
      }

      const [row] = await db
        .update(tasks)
        .set({
          status: "pending_review",
          verifiedBy: null,
          verifiedAt: null,
          reviewNote: null,
        })
        .where(eq(tasks.id, input.id))
        .returning();

      return row;
    }),

  delete: protectedProcedure
    .input(deleteTaskInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await loadTaskOrThrow(input.id);

      const isAdmin = ctx.auth.role === "admin" || isSuperAdmin(ctx.auth.role);
      const isCreator = existing.createdBy === ctx.auth.userId;
      const isDeletableByCreator =
        isCreator && (existing.status === "pending_review" || existing.status === "rejected");

      if (!isAdmin && !isDeletableByCreator) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Tugas ini tidak dapat dihapus",
        });
      }

      await db.delete(tasks).where(eq(tasks.id, input.id));

      return { success: true };
    }),

  addComment: protectedProcedure
    .input(addCommentInput)
    .mutation(async ({ ctx, input }) => {
      requireTaskBoardAccess(ctx.auth.userId, ctx.auth.role);
      await loadTaskOrThrow(input.taskId);

      const commentId = genId("tcmt");

      await db.insert(taskComments).values({
        id: commentId,
        taskId: input.taskId,
        authorId: ctx.auth.userId,
        body: input.body,
      });

      if (input.attachmentUrls.length > 0) {
        await db.insert(taskAttachments).values(
          input.attachmentUrls.map((url) => ({
            id: genId("tatt"),
            taskId: input.taskId,
            commentId,
            url,
            uploadedBy: ctx.auth.userId,
          })),
        );
      }

      return db.query.taskComments.findFirst({
        where: eq(taskComments.id, commentId),
        with: {
          author: { columns: USER_COLUMNS },
          attachments: true,
        },
      });
    }),

  deleteComment: protectedProcedure
    .input(deleteCommentInput)
    .mutation(async ({ ctx, input }) => {
      const comment = await db.query.taskComments.findFirst({
        where: eq(taskComments.id, input.commentId),
      });

      if (!comment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Komentar tidak ditemukan" });
      }

      const isAdmin = ctx.auth.role === "admin" || isSuperAdmin(ctx.auth.role);

      if (comment.authorId !== ctx.auth.userId && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Anda tidak dapat menghapus komentar ini",
        });
      }

      await db.delete(taskComments).where(eq(taskComments.id, input.commentId));

      return { success: true };
    }),

  listAssignableUsers: protectedProcedure.query(async ({ ctx }) => {
    requireTaskBoardAccess(ctx.auth.userId, ctx.auth.role);

    return db
      .selectDistinct({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .innerJoin(userRole, eq(userRole.userId, user.id))
      .innerJoin(role, eq(role.id, userRole.roleId))
      .where(inArray(role.name, TASK_BOARD_ROLES))
      .orderBy(user.name);
  }),
});
