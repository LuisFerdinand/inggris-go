// app/modules/notifications/server/create-notification.ts
// Internal helper used by other routers (task board, orders) to push a
// notification row — not exposed as its own tRPC procedure.

import { eq, inArray } from "drizzle-orm";

import { db } from "@/app/db/db";
import { notifications } from "@/app/db/schema/notifications";
import { user } from "@/app/db/schema/auth-schema";
import { role, userRole } from "@/app/db/schema/roles";
import { generateId } from "@/lib/utils";

type NotificationCategory = "task" | "order" | "class";

type NotifyPayload = {
  category: NotificationCategory;
  type: string;
  title: string;
  body?: string;
  link?: string;
};

export async function notifyUser(userId: string, payload: NotifyPayload) {
  await notifyUsers([userId], payload);
}

/**
 * Bulk-insert the same notification for multiple recipients (e.g. every
 * admin/super_admin) in a single query. De-dupes user ids and no-ops on an
 * empty list.
 */
export async function notifyUsers(userIds: string[], payload: NotifyPayload) {
  const uniqueIds = [...new Set(userIds)].filter(Boolean);
  if (uniqueIds.length === 0) return;

  await db.insert(notifications).values(
    uniqueIds.map((userId) => ({
      id: generateId("notif"),
      userId,
      category: payload.category,
      type: payload.type,
      title: payload.title,
      body: payload.body ?? null,
      link: payload.link ?? null,
    })),
  );
}

/**
 * Every admin/super_admin user id — the recipients for "org-wide" events
 * like a task pending verification or a new order coming in.
 */
export async function getAdminUserIds(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ id: user.id })
    .from(user)
    .innerJoin(userRole, eq(userRole.userId, user.id))
    .innerJoin(role, eq(role.id, userRole.roleId))
    .where(inArray(role.name, ["admin", "super_admin"]));

  return rows.map((row) => row.id);
}

/**
 * Only super_admin ("direktur") user ids — recipients for tasks an admin
 * has escalated for a higher-tier decision.
 */
export async function getSuperAdminUserIds(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ id: user.id })
    .from(user)
    .innerJoin(userRole, eq(userRole.userId, user.id))
    .innerJoin(role, eq(role.id, userRole.roleId))
    .where(inArray(role.name, ["super_admin"]));

  return rows.map((row) => row.id);
}

/**
 * Every author/admin/super_admin user id — the recipients for class-scoring
 * events (e.g. a teacher submitting a score for approval).
 */
export async function getOversightUserIds(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ id: user.id })
    .from(user)
    .innerJoin(userRole, eq(userRole.userId, user.id))
    .innerJoin(role, eq(role.id, userRole.roleId))
    .where(inArray(role.name, ["author", "admin", "super_admin"]));

  return rows.map((row) => row.id);
}
