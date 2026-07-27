// app/modules/task-board/server/access.ts
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { db } from "@/app/db/db";
import { tasks } from "@/app/db/schema/tasks";
import { requireRole } from "@/lib/auth/roles";
import type { Role } from "@/app/db/schema/roles";

// Everyone except students (and guests, who never reach the dashboard).
export const TASK_BOARD_ROLES: Role[] = [
  "user",
  "teacher",
  "author",
  "admin",
  "super_admin",
];

export function genId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function isSuperAdmin(role: Role) {
  return role === "super_admin";
}

export function requireTaskBoardAccess(userId: string | null, role: Role) {
  requireRole({ userId, roles: [role], allowedRoles: TASK_BOARD_ROLES });
}

/**
 * Loads a task and asserts the caller may act on it as an "owner":
 * the creator, the assignee, or an admin/super_admin.
 */
export async function assertTaskOwnerAccess(
  taskId: string,
  userId: string,
  role: Role,
) {
  const row = await db.query.tasks.findFirst({ where: eq(tasks.id, taskId) });

  if (!row) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Tugas tidak ditemukan" });
  }

  const isOwner = row.createdBy === userId || row.assigneeId === userId;
  const isAdmin = role === "admin" || role === "super_admin";

  if (!isOwner && !isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Anda tidak memiliki akses ke tugas ini",
    });
  }

  return row;
}

export async function loadTaskOrThrow(taskId: string) {
  const row = await db.query.tasks.findFirst({ where: eq(tasks.id, taskId) });

  if (!row) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Tugas tidak ditemukan" });
  }

  return row;
}
