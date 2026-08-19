// app/modules/projects/server/project.router.ts
import { TRPCError } from "@trpc/server";
import { eq, inArray, sql } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import { projects } from "@/app/db/schema/projects";
import { tasks } from "@/app/db/schema/tasks";
import {
  canManageProjects,
  genId,
  requireTaskBoardAccess,
} from "@/app/modules/task-board/server/access";
import { notifyUser } from "@/app/modules/notifications/server/create-notification";

import {
  createProjectInput,
  deleteProjectInput,
  getProjectInput,
  listProjectsInput,
  updateProjectInput,
  updateProjectStatusInput,
} from "../project.schema";

const USER_COLUMNS = { id: true, name: true, email: true, image: true } as const;

export const projectRouter = createTRPCRouter({
  list: protectedProcedure.input(listProjectsInput).query(async ({ ctx, input }) => {
    requireTaskBoardAccess(ctx.auth.userId, ctx.auth.role);

    const rows = await db.query.projects.findMany({
      where: input?.status ? eq(projects.status, input.status) : undefined,
      orderBy: (row, { desc }) => [desc(row.createdAt)],
      with: {
        pic: { columns: USER_COLUMNS },
        creator: { columns: USER_COLUMNS },
      },
    });

    if (rows.length === 0) return [];

    const projectIds = rows.map((row) => row.id);

    const taskStats = await db
      .select({
        projectId: tasks.projectId,
        total: sql<number>`count(*)`.mapWith(Number),
        done: sql<number>`count(*) filter (where ${tasks.status} = 'done')`.mapWith(Number),
      })
      .from(tasks)
      .where(inArray(tasks.projectId, projectIds))
      .groupBy(tasks.projectId);

    const statsMap = new Map(taskStats.map((row) => [row.projectId, row]));

    return rows.map((row) => ({
      ...row,
      taskCount: statsMap.get(row.id)?.total ?? 0,
      doneTaskCount: statsMap.get(row.id)?.done ?? 0,
    }));
  }),

  getById: protectedProcedure.input(getProjectInput).query(async ({ ctx, input }) => {
    requireTaskBoardAccess(ctx.auth.userId, ctx.auth.role);

    const row = await db.query.projects.findFirst({
      where: eq(projects.id, input.id),
      with: {
        pic: { columns: USER_COLUMNS },
        creator: { columns: USER_COLUMNS },
      },
    });

    if (!row) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Proyek tidak ditemukan" });
    }

    return row;
  }),

  create: protectedProcedure.input(createProjectInput).mutation(async ({ ctx, input }) => {
    if (!canManageProjects(ctx.auth.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Hanya admin, super admin, atau operational manager yang dapat membuat proyek",
      });
    }

    const id = genId("proj");

    await db.insert(projects).values({
      id,
      name: input.name,
      description: input.description,
      picId: input.picId,
      status: input.status ?? "draft",
      createdBy: ctx.auth.userId,
    });

    if (input.picId && input.picId !== ctx.auth.userId) {
      const actorName = ctx.session?.user?.name ?? "Seseorang";
      await notifyUser(input.picId, {
        category: "task",
        type: "project_pic_assigned",
        title: "Anda ditunjuk sebagai penanggung jawab proyek",
        body: `"${input.name}" — ditunjuk oleh ${actorName}`,
        link: "/dashboard/projects",
      });
    }

    return db.query.projects.findFirst({ where: eq(projects.id, id) });
  }),

  update: protectedProcedure.input(updateProjectInput).mutation(async ({ ctx, input }) => {
    if (!canManageProjects(ctx.auth.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Hanya admin, super admin, atau operational manager yang dapat mengubah proyek",
      });
    }

    const existing = await db.query.projects.findFirst({ where: eq(projects.id, input.id) });
    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Proyek tidak ditemukan" });
    }

    const { id, ...rest } = input;

    const [row] = await db.update(projects).set(rest).where(eq(projects.id, id)).returning();

    if (input.picId && input.picId !== existing.picId && input.picId !== ctx.auth.userId) {
      const actorName = ctx.session?.user?.name ?? "Seseorang";
      await notifyUser(input.picId, {
        category: "task",
        type: "project_pic_assigned",
        title: "Anda ditunjuk sebagai penanggung jawab proyek",
        body: `"${row?.name ?? existing.name}" — ditunjuk oleh ${actorName}`,
        link: "/dashboard/projects",
      });
    }

    return row;
  }),

  updateStatus: protectedProcedure
    .input(updateProjectStatusInput)
    .mutation(async ({ ctx, input }) => {
      if (!canManageProjects(ctx.auth.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Hanya admin, super admin, atau operational manager yang dapat mengubah status proyek",
        });
      }

      const existing = await db.query.projects.findFirst({ where: eq(projects.id, input.id) });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Proyek tidak ditemukan" });
      }

      const [row] = await db
        .update(projects)
        .set({ status: input.status })
        .where(eq(projects.id, input.id))
        .returning();

      return row;
    }),

  delete: protectedProcedure.input(deleteProjectInput).mutation(async ({ ctx, input }) => {
    if (!canManageProjects(ctx.auth.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Hanya admin, super admin, atau operational manager yang dapat menghapus proyek",
      });
    }

    const existing = await db.query.projects.findFirst({ where: eq(projects.id, input.id) });
    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Proyek tidak ditemukan" });
    }

    // Deleting a project cascades to every task inside it (and each task's
    // comments/checklist items/attachments cascade from there in turn) —
    // see tasks.projectId's onDelete: "cascade" foreign key.
    await db.delete(projects).where(eq(projects.id, input.id));

    return { success: true };
  }),
});
