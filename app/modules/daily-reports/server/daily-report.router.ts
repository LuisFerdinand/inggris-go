// app/modules/daily-reports/server/daily-report.router.ts
import { and, eq, inArray } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import { dailyReports } from "@/app/db/schema/daily-reports";
import { user } from "@/app/db/schema/auth-schema";
import { role, userRole } from "@/app/db/schema/roles";
import { requireDbRole, requireRole } from "@/lib/auth/roles";
import { generateId } from "@/lib/utils";
import { TASK_BOARD_ROLES } from "@/app/modules/task-board/server/access";

import { submitReportInput } from "../daily-report.schema";

function todayKey() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const dailyReportRouter = createTRPCRouter({
  getMine: protectedProcedure.query(async ({ ctx }) => {
    requireRole({
      userId: ctx.auth.userId,
      roles: [ctx.auth.role],
      allowedRoles: TASK_BOARD_ROLES,
    });

    const row = await db.query.dailyReports.findFirst({
      where: and(
        eq(dailyReports.userId, ctx.auth.userId),
        eq(dailyReports.reportDate, todayKey()),
      ),
    });

    return row ?? null;
  }),

  submit: protectedProcedure
    .input(submitReportInput)
    .mutation(async ({ ctx, input }) => {
      requireRole({
        userId: ctx.auth.userId,
        roles: [ctx.auth.role],
        allowedRoles: TASK_BOARD_ROLES,
      });

      const reportDate = todayKey();

      const existing = await db.query.dailyReports.findFirst({
        where: and(
          eq(dailyReports.userId, ctx.auth.userId),
          eq(dailyReports.reportDate, reportDate),
        ),
      });

      const values = {
        id: existing?.id ?? generateId("dreport"),
        userId: ctx.auth.userId,
        reportDate,
        content: input.content,
        updatedAt: new Date(),
      };

      const [row] = await db
        .insert(dailyReports)
        .values(values)
        .onConflictDoUpdate({
          target: [dailyReports.userId, dailyReports.reportDate],
          set: { content: values.content, updatedAt: values.updatedAt },
        })
        .returning();

      return row;
    }),

  listToday: protectedProcedure.query(async ({ ctx }) => {
    await requireDbRole(ctx.auth.userId, ["admin", "super_admin"]);

    const reportDate = todayKey();

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

    const reports = await db.query.dailyReports.findMany({
      where: eq(dailyReports.reportDate, reportDate),
    });

    const reportByUser = new Map(reports.map((r) => [r.userId, r]));

    return members.map((member) => {
      const report = reportByUser.get(member.id);
      return {
        ...member,
        submitted: !!report,
        content: report?.content ?? null,
        submittedAt: report?.createdAt ?? null,
      };
    });
  }),
});
