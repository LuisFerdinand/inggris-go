// app/modules/task-board/server/task-board.router.ts
import { z } from "zod";
import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { requireDbRole } from "@/lib/auth/roles";
import { db } from "@/app/db/db";
import {
  getAdminUserIds,
  getSuperAdminUserIds,
  notifyUser,
  notifyUsers,
} from "@/app/modules/notifications/server/create-notification";
import {
  tasks,
  taskComments,
  taskAttachments,
  taskChecklistItems,
} from "@/app/db/schema/tasks";
import { projects } from "@/app/db/schema/projects";
import { user } from "@/app/db/schema/auth-schema";
import { role, userRole } from "@/app/db/schema/roles";

import {
  addChecklistItemInput,
  addCommentInput,
  BOARD_COLUMN_STATUS,
  confirmDoneInput,
  createTaskInput,
  deleteChecklistItemInput,
  deleteCommentInput,
  deleteTaskInput,
  escalateTaskInput,
  listTasksInput,
  markNeedsFixingInput,
  moveTaskInput,
  reorderChecklistItemsInput,
  requestDoneApprovalInput,
  resubmitReviewInput,
  resubmitTaskInput,
  toggleChecklistItemInput,
  updateTaskInput,
  verifyTaskInput,
} from "../task-board.schema";
import {
  TASK_BOARD_ROLES,
  assertTaskOwnerAccess,
  canApproveTasks,
  canEscalateToDirector,
  canRequestDoneApproval,
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
    if (input?.projectId) conditions.push(eq(tasks.projectId, input.projectId));
    if (input?.mine) conditions.push(eq(tasks.createdBy, ctx.auth.userId));

    const rows = await db.query.tasks.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      orderBy: (row, { asc, desc }) => [asc(row.position), desc(row.createdAt)],
      with: {
        project: { columns: { id: true, name: true, status: true } },
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
          project: { columns: { id: true, name: true, status: true } },
          creator: { columns: USER_COLUMNS },
          assignee: { columns: USER_COLUMNS },
          verifier: { columns: USER_COLUMNS },
          attachments: {
            where: (attachment, { isNull }) => isNull(attachment.commentId),
            orderBy: (attachment, { asc }) => [asc(attachment.createdAt)],
          },
          checklistItems: {
            orderBy: (item, { asc }) => [asc(item.position), asc(item.createdAt)],
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

      const project = await db.query.projects.findFirst({
        where: eq(projects.id, input.projectId),
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Proyek tidak ditemukan" });
      }

      if (project.status !== "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Proyek ini tidak sedang berjalan — tugas baru tidak dapat ditambahkan",
        });
      }

      const id = genId("task");
      // An admin/super_admin's own tasks skip verification and land straight
      // in "Direncanakan" — they're already the one who'd approve it anyway.
      const selfApproved = canApproveTasks(ctx.auth.role);

      await db.insert(tasks).values({
        id,
        projectId: input.projectId,
        title: input.title,
        description: input.description,
        priority: input.priority,
        createdBy: ctx.auth.userId,
        assigneeId: input.assigneeId,
        startDate: input.startDate,
        dueDate: input.dueDate,
        coverImageUrl: input.coverImageUrl,
        link: input.link,
        status: selfApproved ? "direncanakan" : "pending_review",
        verifiedBy: selfApproved ? ctx.auth.userId : null,
        verifiedAt: selfApproved ? new Date() : null,
      });

      if (input.checklistItems?.length) {
        await db.insert(taskChecklistItems).values(
          input.checklistItems.map((item, index) => ({
            id: genId("tchk"),
            taskId: id,
            text: item.text,
            position: index,
          })),
        );
      }

      const actorName = ctx.session?.user?.name ?? "Seseorang";

      if (!selfApproved) {
        const adminIds = await getAdminUserIds();
        await notifyUsers(adminIds, {
          category: "task",
          type: "task_pending_review",
          title: "Tugas baru menunggu verifikasi",
          body: `${actorName} mengajukan "${input.title}"`,
          link: "/dashboard/tasks",
        });
      }

      if (input.assigneeId && input.assigneeId !== ctx.auth.userId) {
        await notifyUser(input.assigneeId, {
          category: "task",
          type: "task_assigned",
          title: "Anda ditugaskan pada tugas baru",
          body: `"${input.title}" — ditugaskan oleh ${actorName}`,
          link: "/dashboard/tasks",
        });
      }

      return db.query.tasks.findFirst({ where: eq(tasks.id, id) });
    }),

  update: protectedProcedure
    .input(updateTaskInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await assertTaskOwnerAccess(input.id, ctx.auth.userId, ctx.auth.role);

      const { id, ...rest } = input;

      const [row] = await db
        .update(tasks)
        .set(rest)
        .where(eq(tasks.id, id))
        .returning();

      if (
        input.assigneeId &&
        input.assigneeId !== existing.assigneeId &&
        input.assigneeId !== ctx.auth.userId
      ) {
        const actorName = ctx.session?.user?.name ?? "Seseorang";
        await notifyUser(input.assigneeId, {
          category: "task",
          type: "task_assigned",
          title: "Anda ditugaskan pada sebuah tugas",
          body: `"${row?.title ?? existing.title}" — ditugaskan oleh ${actorName}`,
          link: "/dashboard/tasks",
        });
      }

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
      const existing = await loadTaskOrThrow(input.id);

      if (existing.status !== "pending_review" && existing.status !== "butuh_keputusan") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tugas ini sudah diverifikasi sebelumnya",
        });
      }

      // A task an admin escalated to "butuh keputusan direktur" can only be
      // decided by a super_admin — the first tier (admin or super_admin) is
      // only for plain "pending_review" tasks.
      const canDecide =
        existing.status === "butuh_keputusan"
          ? isSuperAdmin(ctx.auth.role)
          : canApproveTasks(ctx.auth.role);

      if (!canDecide) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            existing.status === "butuh_keputusan"
              ? "Hanya super admin yang dapat memutuskan tugas ini"
              : "Hanya admin atau super admin yang dapat memverifikasi tugas",
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

      if (existing.createdBy !== ctx.auth.userId) {
        await notifyUser(existing.createdBy, {
          category: "task",
          type: input.decision === "approve" ? "task_verified" : "task_rejected",
          title: input.decision === "approve" ? "Tugas disetujui" : "Tugas ditolak",
          body:
            input.decision === "approve"
              ? `"${existing.title}" telah disetujui dan siap dikerjakan`
              : `"${existing.title}" ditolak — ${input.reviewNote}`,
          link: "/dashboard/tasks",
        });
      }

      return row;
    }),

  /**
   * A plain admin escalates a pending task to the director (super_admin)
   * tier when it needs a higher-stakes decision. Only super_admin can then
   * approve/reject it (via `verify`, once status is "butuh_keputusan").
   */
  escalate: protectedProcedure
    .input(escalateTaskInput)
    .mutation(async ({ ctx, input }) => {
      if (!canEscalateToDirector(ctx.auth.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Hanya admin yang dapat mengajukan tugas ke direktur",
        });
      }

      const existing = await loadTaskOrThrow(input.id);

      if (existing.status !== "pending_review") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hanya tugas yang menunggu verifikasi yang dapat diajukan ke direktur",
        });
      }

      const [row] = await db
        .update(tasks)
        .set({ status: "butuh_keputusan" })
        .where(eq(tasks.id, input.id))
        .returning();

      const actorName = ctx.session?.user?.name ?? "Admin";
      const superAdminIds = await getSuperAdminUserIds();
      await notifyUsers(superAdminIds, {
        category: "task",
        type: "task_escalated",
        title: "Butuh keputusan direktur",
        body: `${actorName} mengajukan "${existing.title}" untuk keputusan direktur`,
        link: "/dashboard/tasks/keputusan-direktur",
      });

      return row;
    }),

  /**
   * Admin or super_admin confirms a task as actually done straight from
   * "review" — the normal path, matching the manager sign-off in the
   * workflow doc. But once an admin has specifically routed a task to
   * "pending_director_approval" via requestDoneApproval, only super_admin
   * can decide it from there — same reasoning as `verify`'s
   * "butuh_keputusan" tier: the admin already deferred that call, so they
   * shouldn't be able to bypass their own escalation. This is the only way
   * into "done": dragging or editing your way in is blocked.
   */
  confirmDone: protectedProcedure
    .input(confirmDoneInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await loadTaskOrThrow(input.id);

      if (existing.status !== "review" && existing.status !== "pending_director_approval") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tugas ini belum diajukan untuk review",
        });
      }

      const canDecide =
        existing.status === "pending_director_approval"
          ? isSuperAdmin(ctx.auth.role)
          : canApproveTasks(ctx.auth.role);

      if (!canDecide) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            existing.status === "pending_director_approval"
              ? "Hanya super admin yang dapat memutuskan tugas ini"
              : "Hanya admin atau super admin yang dapat menandai tugas selesai",
        });
      }

      const [row] = await db
        .update(tasks)
        .set({ status: "done", reviewNote: null })
        .where(eq(tasks.id, input.id))
        .returning();

      const recipients = [existing.createdBy, existing.assigneeId].filter(
        (recipientId): recipientId is string =>
          !!recipientId && recipientId !== ctx.auth.userId,
      );
      await notifyUsers(recipients, {
        category: "task",
        type: "task_done",
        title: "Tugas ditandai selesai",
        body: `"${existing.title}" telah selesai`,
        link: "/dashboard/tasks",
      });

      return row;
    }),

  /**
   * A plain admin routes a reviewed task to the director (super_admin) for
   * final done approval, instead of confirming it done themselves. Mirrors
   * `escalate` (pending_review -> butuh_keputusan) but for the review ->
   * done transition.
   */
  requestDoneApproval: protectedProcedure
    .input(requestDoneApprovalInput)
    .mutation(async ({ ctx, input }) => {
      if (!canRequestDoneApproval(ctx.auth.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Hanya admin yang dapat mengajukan persetujuan direktur",
        });
      }

      const existing = await loadTaskOrThrow(input.id);

      if (existing.status !== "review") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hanya tugas yang sedang direview yang dapat diajukan untuk persetujuan direktur",
        });
      }

      const [row] = await db
        .update(tasks)
        .set({ status: "pending_director_approval" })
        .where(eq(tasks.id, input.id))
        .returning();

      const actorName = ctx.session?.user?.name ?? "Admin";
      const superAdminIds = await getSuperAdminUserIds();
      await notifyUsers(superAdminIds, {
        category: "task",
        type: "task_pending_director_approval",
        title: "Butuh persetujuan direktur",
        body: `${actorName} mengajukan "${existing.title}" untuk persetujuan penyelesaian`,
        link: "/dashboard/tasks/persetujuan-done",
      });

      return row;
    }),

  /**
   * Admin or super_admin sends a "review" task back to the assignee/creator
   * for fixes. For "pending_director_approval" the same deferral logic as
   * confirmDone applies: only super_admin decides once an admin has routed
   * it to the director.
   */
  markNeedsFixing: protectedProcedure
    .input(markNeedsFixingInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await loadTaskOrThrow(input.id);

      if (existing.status !== "review" && existing.status !== "pending_director_approval") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tugas ini tidak sedang dalam status review",
        });
      }

      const canDecide =
        existing.status === "pending_director_approval"
          ? isSuperAdmin(ctx.auth.role)
          : canApproveTasks(ctx.auth.role);

      if (!canDecide) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            existing.status === "pending_director_approval"
              ? "Hanya super admin yang dapat memutuskan tugas ini"
              : "Hanya admin atau super admin yang dapat menandai tugas perlu perbaikan",
        });
      }

      const [row] = await db
        .update(tasks)
        .set({ status: "needs_fixing", reviewNote: input.reviewNote ?? null })
        .where(eq(tasks.id, input.id))
        .returning();

      const actorName = ctx.session?.user?.name ?? "Seseorang";
      const recipients = [existing.createdBy, existing.assigneeId].filter(
        (recipientId): recipientId is string =>
          !!recipientId && recipientId !== ctx.auth.userId,
      );
      await notifyUsers(recipients, {
        category: "task",
        type: "task_needs_fixing",
        title: "Tugas perlu perbaikan",
        body: input.reviewNote
          ? `"${existing.title}" perlu perbaikan — ${input.reviewNote}`
          : `"${existing.title}" perlu perbaikan sebelum ditandai selesai`,
        link: "/dashboard/tasks",
      });

      return row;
    }),

  /**
   * The creator/assignee (or admin) re-submits a "needs_fixing" task for
   * review, once the requested fixes are done.
   */
  resubmitForReview: protectedProcedure
    .input(resubmitReviewInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await assertTaskOwnerAccess(input.id, ctx.auth.userId, ctx.auth.role);

      if (existing.status !== "needs_fixing") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hanya tugas berstatus perlu perbaikan yang dapat diajukan review ulang",
        });
      }

      const [row] = await db
        .update(tasks)
        .set({ status: "review", reviewNote: null })
        .where(eq(tasks.id, input.id))
        .returning();

      const actorName = ctx.session?.user?.name ?? "Seseorang";
      const adminIds = await getAdminUserIds();
      await notifyUsers(adminIds, {
        category: "task",
        type: "task_review_again",
        title: "Tugas diajukan review ulang",
        body: `${actorName} mengajukan ulang "${existing.title}" untuk direview`,
        link: "/dashboard/tasks",
      });

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

      const actorName = ctx.session?.user?.name ?? "Seseorang";
      const adminIds = await getAdminUserIds();
      await notifyUsers(adminIds, {
        category: "task",
        type: "task_pending_review",
        title: "Tugas diajukan ulang",
        body: `${actorName} mengajukan ulang "${existing.title}"`,
        link: "/dashboard/tasks",
      });

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
      const task = await loadTaskOrThrow(input.taskId);

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

      const actorName = ctx.session?.user?.name ?? "Seseorang";
      const commentRecipients = [task.createdBy, task.assigneeId].filter(
        (recipientId): recipientId is string =>
          !!recipientId && recipientId !== ctx.auth.userId,
      );
      await notifyUsers(commentRecipients, {
        category: "task",
        type: "task_comment",
        title: "Komentar baru pada tugas",
        body: `${actorName} pada "${task.title}": ${input.body.slice(0, 80)}`,
        link: "/dashboard/tasks",
      });

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

  addChecklistItem: protectedProcedure
    .input(addChecklistItemInput)
    .mutation(async ({ ctx, input }) => {
      await assertTaskOwnerAccess(input.taskId, ctx.auth.userId, ctx.auth.role);

      const [maxPositionRow] = await db
        .select({ max: sql<number>`coalesce(max(${taskChecklistItems.position}), -1)`.mapWith(Number) })
        .from(taskChecklistItems)
        .where(eq(taskChecklistItems.taskId, input.taskId));

      const id = genId("tchk");

      await db.insert(taskChecklistItems).values({
        id,
        taskId: input.taskId,
        text: input.text,
        position: (maxPositionRow?.max ?? -1) + 1,
      });

      return db.query.taskChecklistItems.findFirst({
        where: eq(taskChecklistItems.id, id),
      });
    }),

  toggleChecklistItem: protectedProcedure
    .input(toggleChecklistItemInput)
    .mutation(async ({ ctx, input }) => {
      const item = await db.query.taskChecklistItems.findFirst({
        where: eq(taskChecklistItems.id, input.id),
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item checklist tidak ditemukan" });
      }

      await assertTaskOwnerAccess(item.taskId, ctx.auth.userId, ctx.auth.role);

      const [row] = await db
        .update(taskChecklistItems)
        .set({ done: input.done })
        .where(eq(taskChecklistItems.id, input.id))
        .returning();

      return row;
    }),

  deleteChecklistItem: protectedProcedure
    .input(deleteChecklistItemInput)
    .mutation(async ({ ctx, input }) => {
      const item = await db.query.taskChecklistItems.findFirst({
        where: eq(taskChecklistItems.id, input.id),
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item checklist tidak ditemukan" });
      }

      await assertTaskOwnerAccess(item.taskId, ctx.auth.userId, ctx.auth.role);

      await db.delete(taskChecklistItems).where(eq(taskChecklistItems.id, input.id));

      return { success: true };
    }),

  reorderChecklistItems: protectedProcedure
    .input(reorderChecklistItemsInput)
    .mutation(async ({ ctx, input }) => {
      await assertTaskOwnerAccess(input.taskId, ctx.auth.userId, ctx.auth.role);

      const existing = await db.query.taskChecklistItems.findMany({
        where: eq(taskChecklistItems.taskId, input.taskId),
        columns: { id: true },
      });

      const existingIds = new Set(existing.map((row) => row.id));
      const orderedIds = [...new Set(input.orderedIds)];

      if (
        orderedIds.length !== existingIds.size ||
        !orderedIds.every((id) => existingIds.has(id))
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Urutan checklist tidak valid",
        });
      }

      await db.transaction(async (tx) => {
        await Promise.all(
          orderedIds.map((id, index) =>
            tx
              .update(taskChecklistItems)
              .set({ position: index })
              .where(eq(taskChecklistItems.id, id)),
          ),
        );
      });

      return { success: true };
    }),

  /**
   * Sidebar badge counts for the two approval queues — zeroed out for
   * roles that can't act on that queue rather than erroring, so the
   * sidebar can call this unconditionally for any task-board role.
   */
  badgeCounts: protectedProcedure.query(async ({ ctx }) => {
    requireTaskBoardAccess(ctx.auth.userId, ctx.auth.role);

    const canSeeApprovals = canApproveTasks(ctx.auth.role);
    const canSeeDirector = isSuperAdmin(ctx.auth.role);

    const [pendingReviewRow] = canSeeApprovals
      ? await db
          .select({ count: sql<number>`count(*)`.mapWith(Number) })
          .from(tasks)
          .where(eq(tasks.status, "pending_review"))
      : [{ count: 0 }];

    const [butuhKeputusanRow] = canSeeDirector
      ? await db
          .select({ count: sql<number>`count(*)`.mapWith(Number) })
          .from(tasks)
          .where(eq(tasks.status, "butuh_keputusan"))
      : [{ count: 0 }];

    const [pendingDoneApprovalRow] = canSeeDirector
      ? await db
          .select({ count: sql<number>`count(*)`.mapWith(Number) })
          .from(tasks)
          .where(eq(tasks.status, "pending_director_approval"))
      : [{ count: 0 }];

    return {
      pendingReview: pendingReviewRow?.count ?? 0,
      butuhKeputusan: butuhKeputusanRow?.count ?? 0,
      pendingDoneApproval: pendingDoneApprovalRow?.count ?? 0,
    };
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

  /**
   * Simple per-member kinerja (performance) summary for the "Tim" dashboard —
   * admin/super_admin only. Aggregates each assignee's tasks into a rough
   * 1-5 score, the same kind of formula the reference prototype used
   * (penalize overdue and rejected tasks), without any historical trend.
   */
  teamPerformance: protectedProcedure.query(async ({ ctx }) => {
    await requireDbRole(ctx.auth.userId, ["admin", "super_admin"]);

    const members = await db
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

    const stats = await db
      .select({
        assigneeId: tasks.assigneeId,
        total: sql<number>`count(*)`.mapWith(Number),
        done: sql<number>`count(*) filter (where ${tasks.status} = 'done')`.mapWith(Number),
        rejected: sql<number>`count(*) filter (where ${tasks.status} = 'rejected')`.mapWith(Number),
        overdue: sql<number>`count(*) filter (where ${tasks.dueDate} is not null and ${tasks.dueDate} < now() and ${tasks.status} not in ('done', 'rejected'))`.mapWith(Number),
      })
      .from(tasks)
      .where(isNotNull(tasks.assigneeId))
      .groupBy(tasks.assigneeId);

    const statsByAssignee = new Map(stats.map((row) => [row.assigneeId, row]));

    return members.map((member) => {
      const row = statsByAssignee.get(member.id);
      const total = row?.total ?? 0;
      const done = row?.done ?? 0;
      const rejected = row?.rejected ?? 0;
      const overdue = row?.overdue ?? 0;
      const active = Math.max(0, total - done - rejected);
      const score =
        Math.round(Math.max(1, Math.min(5, 5 - overdue * 0.6 - rejected * 0.3)) * 10) / 10;

      return { ...member, total, active, done, rejected, overdue, score };
    });
  }),
});
