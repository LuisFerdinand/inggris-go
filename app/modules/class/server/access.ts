// app/modules/class/server/access.ts
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { db } from "@/app/db/db";
import { classes } from "@/app/db/schema/classes";
import { requireRole } from "@/lib/auth/roles";
import type { Role } from "@/app/db/schema/roles";

export const TEACHING_ROLES: Role[] = ["teacher", "admin"];

export function genId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function isOversightRole(role: Role) {
  return role === "admin" || role === "super_admin";
}

export function requireTeachingAccess(userId: string | null, role: Role) {
  requireRole({ userId, roles: [role], allowedRoles: TEACHING_ROLES });
}

/**
 * Loads a class and asserts the caller may act on it: the assigned
 * teacher, or an admin/super_admin with oversight access.
 */
export async function assertClassAccess(
  classId: string,
  userId: string,
  role: Role,
) {
  const row = await db.query.classes.findFirst({
    where: eq(classes.id, classId),
  });

  if (!row) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Kelas tidak ditemukan" });
  }

  if (!isOversightRole(role) && row.teacherId !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Anda tidak memiliki akses ke kelas ini",
    });
  }

  return row;
}
