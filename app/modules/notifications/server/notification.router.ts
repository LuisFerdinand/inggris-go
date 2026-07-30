// app/modules/notifications/server/notification.router.ts
import { and, eq, sql } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import { notifications } from "@/app/db/schema/notifications";

import { listNotificationsInput, markReadInput } from "../notification.schema";

export const notificationRouter = createTRPCRouter({
  list: protectedProcedure
    .input(listNotificationsInput)
    .query(async ({ ctx, input }) => {
      return db.query.notifications.findMany({
        where: eq(notifications.userId, ctx.auth.userId),
        orderBy: (n, { desc }) => [desc(n.createdAt)],
        limit: input?.limit ?? 20,
      });
    }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const [row] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, ctx.auth.userId),
          eq(notifications.isRead, false),
        ),
      );

    return row?.count ?? 0;
  }),

  markRead: protectedProcedure
    .input(markReadInput)
    .mutation(async ({ ctx, input }) => {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.id, input.id),
            eq(notifications.userId, ctx.auth.userId),
          ),
        );

      return { success: true };
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, ctx.auth.userId),
          eq(notifications.isRead, false),
        ),
      );

    return { success: true };
  }),
});
