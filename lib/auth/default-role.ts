// lib/auth/default-role.ts
import { eq } from "drizzle-orm";

import { db } from "@/app/db/db";
import { role, userRole, type Role } from "@/app/db/schema/roles";
import { generateId } from "@/lib/utils";

export async function getDefaultUserRoleId() {
  const existingRole = await db
    .select({ id: role.id })
    .from(role)
    .where(eq(role.name, "user"))
    .limit(1);

  if (existingRole[0]) {
    return existingRole[0].id;
  }

  const roleId = generateId("role");

  await db.insert(role).values({
    id: roleId,
    name: "user",
    description: "Regular user",
  });

  return roleId;
}

export async function ensureDefaultUserRole(userId: string) {
  const roleId = await getDefaultUserRoleId();

  await db
    .insert(userRole)
    .values({
      id: generateId("user-role"),
      userId,
      roleId,
    })
    .onConflictDoNothing();
}

export async function getUserRoles(userId: string): Promise<Role[]> {
  const rows = await db
    .select({
      name: role.name,
    })
    .from(userRole)
    .innerJoin(role, eq(userRole.roleId, role.id))
    .where(eq(userRole.userId, userId));

  return rows.map((item) => item.name);
}

export function getPrimaryRole(roles: Role[]): Role {
  const priority: Role[] = [
    "super_admin",
    "admin",
    "author",
    "teacher",
    "student",
    "user",
    "guest",
  ];

  return priority.find((item) => roles.includes(item)) ?? "user";
}